import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, Shield } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const CATEGORIES = ['Haftpflicht','Kranken','Hausrat','KFZ','Leben','Unfall','Berufsunfähigkeit','Sonstiges']
const CAT_ICONS: Record<string,string> = {
  Haftpflicht:'🛡️', Kranken:'💊', Hausrat:'🏠', KFZ:'🚗', Leben:'❤️', Unfall:'🩹', Berufsunfähigkeit:'💼', Sonstiges:'📋'
}

export function VersicherungenPage() {
  const { insurances, setInsurances, userId } = useStore()
  const [showAdd, setAdd] = useState(false)

  const monthlyTotal = insurances.reduce((s,i) => s+(i.recurrence==='monthly'?i.amount:i.amount/12), 0)
  const yearlyTotal  = monthlyTotal * 12

  const coreCategories = ['Haftpflicht','Kranken','Hausrat','Berufsunfähigkeit']
  const existingCategories = insurances.map(i => i.category)
  const missingCategories = coreCategories.filter(c => !existingCategories.includes(c))

  async function del(id: string) {
    if (userId) await supabase.from('insurances').delete().eq('id', id)
    setInsurances(insurances.filter(i => i.id !== id))
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">Versicherungen</h1>
        <button onClick={() => setAdd(true)}
          style={{ width:48,height:48,borderRadius:16,background:'var(--accent)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:4 }}>
          <Plus width={20} height={20} style={{ color:'white' }}/>
        </button>
      </div>

      {/* Summary */}
      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ padding:20, marginBottom:12 }}>
          <p style={{ fontSize:12,color:'var(--tertiary)',fontWeight:600,marginBottom:8 }}>Versicherungskosten</p>
          <p style={{ fontSize:32,fontWeight:800,color:'var(--primary)',letterSpacing:'-0.04em' }}>
            {fmt(monthlyTotal)}
          </p>
          <p style={{ fontSize:14,color:'var(--secondary)',marginTop:4 }}>
            {fmt(yearlyTotal)} pro Jahr
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="app-card" style={{ padding:16 }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',marginBottom:6 }}>Verträge</p>
            <p style={{ fontSize:22,fontWeight:800,color:'var(--primary)' }}>{insurances.length}</p>
          </div>

          <div className="app-card" style={{ padding:16 }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',marginBottom:6 }}>Jährliche Policen</p>
            <p style={{ fontSize:22,fontWeight:800,color:'var(--primary)' }}>
              {insurances.filter(i => i.recurrence === 'yearly').length}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ padding:18 }}>
          <p style={{ fontSize:12,color:'var(--tertiary)',fontWeight:600,marginBottom:12 }}>
            Versicherungs-Check
          </p>

          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {coreCategories.map(cat => {
              const exists = existingCategories.includes(cat)
              return (
                <div key={cat} style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <span style={{ fontSize:14,color:'var(--primary)' }}>{cat}</span>
                  <span style={{ fontSize:13,fontWeight:600,color: exists ? 'var(--success)' : 'var(--accent)' }}>
                    {exists ? '✓ Vorhanden' : '⚠ Fehlt'}
                  </span>
                </div>
              )
            })}
          </div>

          {missingCategories.length > 0 && (
            <div style={{
              marginTop:14,
              padding:'12px 14px',
              borderRadius:12,
              background:'rgba(229,72,63,0.08)'
            }}>
              <p style={{ fontSize:13,color:'var(--accent)',fontWeight:600 }}>
                Möglicherweise fehlend: {missingCategories.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding:'0 20px' }}>
        {insurances.length === 0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',gap:12 }}>
            <Shield width={60} height={60} style={{ color:'var(--tertiary)',opacity:0.3 }}/>
            <p style={{ fontSize:15,color:'var(--tertiary)',textAlign:'center' }}>Noch keine Versicherungen eingetragen.</p>
          </div>
        ) : (
          <div className="app-card" style={{ padding:0,overflow:'hidden' }}>
            {insurances.map((ins, i) => (
              <motion.div key={ins.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 20px', borderBottom:i<insurances.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:52,height:52,borderRadius:16,background:'rgba(229,72,63,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20 }}>
                  {CAT_ICONS[ins.category??''] ?? '🛡️'}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:16,fontWeight:700,color:'var(--primary)',marginBottom:2 }}>{ins.name}</p>
                  <p style={{ fontSize:13,color:'var(--tertiary)' }}>
                    {ins.provider || 'Kein Anbieter'} · {ins.recurrence==='yearly'?'jährlich':'monatlich'}
                  </p>
                </div>
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <p style={{ fontSize:17,fontWeight:800,color:'var(--accent)',marginBottom:2 }}>{fmt(ins.amount)}</p>
                  <p style={{ fontSize:11,color:'var(--tertiary)' }}>{fmt(ins.recurrence==='monthly'?ins.amount:ins.amount/12)}/mo</p>
                </div>
                <button onClick={() => del(ins.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:4,marginLeft:4 }}>
                  <Trash2 width={16} height={16} style={{ color:'var(--tertiary)' }}/>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddSheet onClose={() => setAdd(false)}/>}
    </div>
  )
}

function AddSheet({ onClose }: { onClose:()=>void }) {
  const { insurances, setInsurances, userId } = useStore()
  const [form, setForm] = useState({ name:'', provider:'', amount:'', period:'monthly' as 'monthly'|'yearly', category:CATEGORIES[0] })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function save() {
    if (!form.name||!form.amount) { setErr('Name und Betrag erforderlich.'); return }
    setSaving(true)
    const ins = { user_id:userId??'demo', name:form.name, provider:form.provider, amount:parseFloat(form.amount), recurrence:form.period, category:form.category }
    if (userId) {
      const { data:row, error } = await supabase.from('insurances').insert(ins).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      if (row) setInsurances([...insurances, row])
    } else {
      setInsurances([...insurances, {...ins, id:Date.now().toString(), created_at:new Date().toISOString()}])
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Neue Versicherung</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <input className="ak-input" placeholder="Name (z.B. Haftpflicht)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input className="ak-input" placeholder="Anbieter (z.B. Allianz)" value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))}/>
          <input className="ak-input" type="number" inputMode="decimal" placeholder="Betrag in €" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,background:'var(--bg)',borderRadius:16,padding:4 }}>
            {(['monthly','yearly'] as const).map(v=>(
              <button key={v} onClick={()=>setForm(f=>({...f,period:v}))}
                style={{ padding:'10px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,
                         background:form.period===v?'var(--surface)':'transparent',
                         color:form.period===v?'var(--primary)':'var(--tertiary)',
                         boxShadow:form.period===v?'var(--shadow-sm)':'none' }}>
                {v==='monthly'?'Monatlich':'Jährlich'}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Kategorie</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,category:c}))} className={`cat-chip ${form.category===c?'selected':''}`}>{c}</button>
              ))}
            </div>
          </div>
          {err && <p style={{ fontSize:13,color:'var(--danger)',background:'rgba(239,68,68,0.08)',padding:'10px 14px',borderRadius:12 }}>{err}</p>}
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Speichern...':'Eintragen'}</button>
        </div>
      </div>
    </div>
  )
}
