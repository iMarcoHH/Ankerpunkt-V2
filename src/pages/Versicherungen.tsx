import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, Shield, Pencil } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const CATEGORIES = ['Haftpflicht','Hausrat','KFZ','Leben','Unfall','Berufsunfähigkeit','Rechtsschutz','Zahnzusatz','Reise','Tier','Sonstiges']
const CAT_ICONS: Record<string,string> = {
  Haftpflicht:'🛡️', Hausrat:'🏠', KFZ:'🚗', Leben:'❤️',
  Unfall:'🩹', Berufsunfähigkeit:'💼', Rechtsschutz:'⚖️',
  Zahnzusatz:'🦷', Reise:'✈️', Tier:'🐾', Sonstiges:'📋'
}

export function VersicherungenPage() {
  const { insurances, setInsurances, userId } = useStore()
  const [showAdd, setAdd] = useState(false)
  const [editInsurance, setEditInsurance] = useState<any | null>(null)

  const monthlyTotal = insurances.reduce((s,i) => s+(i.recurrence==='monthly'?i.amount:i.amount/12), 0)
  const yearlyTotal  = monthlyTotal * 12

  const mostExpensive = insurances.reduce((max, current) => {
    const currentMonthly = current.recurrence === 'monthly' ? current.amount : current.amount / 12
    const maxMonthly = max ? (max.recurrence === 'monthly' ? max.amount : max.amount / 12) : 0
    return currentMonthly > maxMonthly ? current : max
  }, insurances[0])

  const coreCategories = ['Haftpflicht','Hausrat','Berufsunfähigkeit','Rechtsschutz']
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

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        {mostExpensive && (
          <div className="app-card" style={{ padding:16 }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',marginBottom:6 }}>
              💸 Teuerste Versicherung
            </p>
            <p style={{ fontSize:16,fontWeight:700,color:'var(--primary)' }}>
              {mostExpensive.name}
            </p>
            <p style={{ fontSize:13,color:'var(--secondary)',marginTop:2 }}>
              {mostExpensive.provider || 'Kein Anbieter'}
            </p>
          </div>
        )}
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
                style={{ display:'flex',alignItems:'flex-start',gap:14,padding:'18px 20px', borderBottom:i<insurances.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:52,height:52,borderRadius:16,background:'rgba(229,72,63,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20,overflow:'hidden' }}>
                  {ins.provider ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${ins.provider.toLowerCase().replace(/\s+/g,'')}.de&sz=64`}
                      alt={ins.provider}
                      style={{ width:28, height:28, borderRadius:4, objectFit:'contain' }}
                      onError={e => { const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.textContent=CAT_ICONS[ins.category??'']??'🛡️' }}
                    />
                  ) : CAT_ICONS[ins.category??''] ?? '🛡️'}
                </div>
                <div style={{ flex:1,minWidth:0,paddingRight:12 }}>
                  <p
                    style={{
                      fontSize:16,
                      fontWeight:700,
                      color:'var(--primary)',
                      marginBottom:6,
                      lineHeight:1.35,
                      wordBreak:'break-word'
                    }}
                  >
                    {ins.name}
                  </p>
                  <p style={{ fontSize:13,color:'var(--tertiary)' }}>
                    {ins.provider || 'Kein Anbieter'} · {ins.recurrence==='yearly'?'jährlich':'monatlich'}
                  </p>
                </div>
                <div style={{ textAlign:'right',flexShrink:0,minWidth:95, paddingTop:2 }}>
                  <p style={{ fontSize:17,fontWeight:800,color:'var(--accent)',marginBottom:2 }}>{fmt(ins.amount)}</p>
                  <p style={{ fontSize:11,color:'var(--tertiary)' }}>{fmt(ins.recurrence==='monthly'?ins.amount:ins.amount/12)}/mo</p>
                </div>
                <button onClick={() => setEditInsurance(ins)} style={{ background:'none',border:'none',cursor:'pointer',padding:4,marginLeft:4 }}>
                  <Pencil width={16} height={16} style={{ color:'var(--tertiary)' }}/>
                </button>
                <button onClick={() => del(ins.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:4,marginLeft:4 }}>
                  <Trash2 width={16} height={16} style={{ color:'var(--tertiary)' }}/>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddSheet onClose={() => setAdd(false)}/>}
      {editInsurance && <EditInsuranceSheet insurance={editInsurance} onClose={() => setEditInsurance(null)} />}
    </div>
  )
}

function AddSheet({ onClose }: { onClose:()=>void }) {
  const { insurances, setInsurances, userId } = useStore()
  const [form, setForm] = useState({ name:'', provider:'', providerLogo:'', amount:'', period:'monthly' as 'monthly'|'yearly', category:CATEGORIES[0] })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [providers, setProviders] = useState<any[]>([])
  const [providerSearch, setProviderSearch] = useState('')
  const [showProviders, setShowProviders] = useState(false)

  // Anbieter aus DB laden
  useState(() => {
    supabase.from('insurance_providers').select('*').order('name').then(({ data }) => {
      if (data) setProviders(data)
    })
  })

  const filteredProviders = providers.filter(p =>
    !providerSearch || p.name.toLowerCase().includes(providerSearch.toLowerCase())
  ).slice(0, 8)

  function selectProvider(p: any) {
    setForm(f => ({ ...f, provider: p.name, providerLogo: p.logo_url }))
    setProviderSearch(p.name)
    setShowProviders(false)
  }

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

          {/* Anbieter mit Logo-Suche */}
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {form.providerLogo && (
                <img src={form.providerLogo} alt={form.provider}
                  style={{ width:32, height:32, borderRadius:8, objectFit:'contain', background:'white', padding:2, border:'1px solid var(--border)', flexShrink:0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display='none' }}
                />
              )}
              <input className="ak-input" placeholder="Anbieter suchen (z.B. Allianz)"
                value={providerSearch}
                onChange={e => { setProviderSearch(e.target.value); setForm(f=>({...f,provider:e.target.value,providerLogo:''})); setShowProviders(true) }}
                onFocus={() => setShowProviders(true)}
                style={{ flex:1 }}
              />
            </div>
            {showProviders && filteredProviders.length > 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, marginTop:4,
                            background:'var(--surface)', borderRadius:16, boxShadow:'var(--shadow-lg)', overflow:'hidden', border:'1px solid var(--border)' }}>
                {filteredProviders.map(p => (
                  <button key={p.id} onClick={() => selectProvider(p)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                             background:'none', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', textAlign:'left' }}>
                    <img src={p.logo_url} alt={p.name}
                      style={{ width:28, height:28, borderRadius:4, objectFit:'contain', flexShrink:0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display='none' }}
                    />
                    <span style={{ fontSize:14, fontWeight:500, color:'var(--primary)' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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


function EditInsuranceSheet({ insurance, onClose }: { insurance:any; onClose:()=>void }) {
  const { insurances, setInsurances, userId } = useStore()

  const [form, setForm] = useState({
    name: insurance.name || '',
    provider: insurance.provider || '',
    amount: String(insurance.amount || ''),
    period: insurance.recurrence || 'monthly',
    category: insurance.category || CATEGORIES[0]
  })

  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function save() {
    setSaving(true)

    const update = {
      name: form.name,
      provider: form.provider,
      amount: parseFloat(form.amount),
      recurrence: form.period,
      category: form.category
    }

    try {
      if (userId) {
        const { error } = await supabase
          .from('insurances')
          .update(update)
          .eq('id', insurance.id)

        if (error) throw error
      }

      setInsurances(
        insurances.map(i =>
          i.id === insurance.id ? { ...i, ...update } : i
        )
      )

      onClose()
    } catch (e:any) {
      setErr(e?.message || 'Fehler beim Speichern')
    }

    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>

        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Versicherung bearbeiten</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <input className="ak-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input className="ak-input" value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))}/>
          <input className="ak-input" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>

          {err && <p style={{ color:'var(--danger)', fontSize:13 }}>{err}</p>}

          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Speichern...' : 'Änderungen speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}