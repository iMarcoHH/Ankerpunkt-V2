import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import type { Debt } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Calendar, ChevronRight } from 'lucide-react'
import { X } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const DEBT_COLORS = ['#E5483F','#F59E0B','#3B82F6','#22C55E','#8B5CF6','#F97316']
const DEBT_CATEGORIES = ['Kredit','Raten','Dispo','Freunde/Familie','Studentenkredit','Sonstiges']

function calcMonthsLeft(total: number, paid: number, rate: number) {
  if (!rate||rate<=0) return null
  const left = total - paid
  if (left<=0) return null
  return Math.ceil(left/rate)
}
function calcEndDate(total: number, paid: number, rate: number, start: string) {
  const months = calcMonthsLeft(total,paid,rate)
  if (!months) return null
  const base = start ? new Date(start+'-01') : new Date()
  base.setMonth(base.getMonth()+months)
  return base.toLocaleDateString('de-DE',{month:'long',year:'numeric'})
}

export function SchuldenPage() {
  const { debts, setDebts, userId } = useStore()
  const [showAdd, setAdd]     = useState(false)
  const [showPay, setShowPay] = useState<Debt|null>(null)

  const totalLeft    = debts.reduce((s,d)=>s+(d.total_amount-d.paid_amount),0)
  const totalDebt    = debts.reduce((s,d)=>s+d.total_amount,0)
  const monthlyTotal = debts.reduce((s,d)=>s+d.monthly_rate,0)
  const overallPct   = totalDebt>0?(1-totalLeft/totalDebt)*100:0

  const latestEnd = useMemo(()=>{
    const dates = debts.filter(d=>d.monthly_rate>0&&d.paid_amount<d.total_amount).map(d=>{
      const m=calcMonthsLeft(d.total_amount,d.paid_amount,d.monthly_rate)??0
      const dt=new Date(); dt.setMonth(dt.getMonth()+m); return dt
    })
    if (!dates.length) return null
    return new Date(Math.max(...dates.map(d=>d.getTime()))).toLocaleDateString('de-DE',{month:'long',year:'numeric'})
  },[debts])

  async function del(id: string) {
    if (userId) await supabase.from('debts').delete().eq('id',id)
    setDebts(debts.filter(d=>d.id!==id))
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">Schulden</h1>
        <button onClick={()=>setAdd(true)}
          style={{ width:40,height:40,borderRadius:12,background:'var(--accent)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:4 }}>
          <Plus width={20} height={20} style={{ color:'white' }}/>
        </button>
      </div>

      {debts.length===0 ? (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 20px',gap:12 }}>
          <p style={{ fontSize:48 }}>🎉</p>
          <p style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Keine Schulden!</p>
          <p style={{ fontSize:15,color:'var(--tertiary)',textAlign:'center' }}>Trag hier Kredite und Ratenzahlungen ein.</p>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div style={{ padding:'0 20px 20px' }}>
            <div className="app-card" style={{ background:'var(--surface)' }}>
              <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:4 }}>Noch offen</p>
              <p style={{ fontSize:36,fontWeight:800,color:'var(--accent)',letterSpacing:'-0.03em',marginBottom:2 }}>{fmt(totalLeft)}</p>
              <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:16 }}>von {fmt(totalDebt)} gesamt · {overallPct.toFixed(0)}% abbezahlt</p>
              <div style={{ height:8,borderRadius:4,background:'var(--bg)',overflow:'hidden',marginBottom:12 }}>
                <motion.div style={{ height:'100%',borderRadius:4,background:'var(--accent)' }}
                  initial={{width:0}} animate={{width:`${overallPct}%`}} transition={{duration:1}}/>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:2 }}>Monatliche Rate</p>
                  <p style={{ fontSize:17,fontWeight:700,color:'var(--primary)' }}>{fmt(monthlyTotal)}</p>
                </div>
                {latestEnd && (
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:2 }}>Schuldenfrei</p>
                    <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                      <Calendar width={12} height={12} style={{ color:'var(--success)' }}/>
                      <p style={{ fontSize:13,fontWeight:600,color:'var(--success)' }}>{latestEnd}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pläne */}
          <div style={{ padding:'0 20px' }}>
            <p style={{ fontSize:20,fontWeight:700,color:'var(--primary)',marginBottom:12 }}>Deine Pläne</p>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {debts.map((debt,i)=>{
                const left=debt.total_amount-debt.paid_amount
                const pct=debt.total_amount>0?(debt.paid_amount/debt.total_amount)*100:0
                const months=calcMonthsLeft(debt.total_amount,debt.paid_amount,debt.monthly_rate)
                const end=calcEndDate(debt.total_amount,debt.paid_amount,debt.monthly_rate,debt.due_date??'')
                const done=left<=0
                return (
                  <motion.div key={debt.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
                    <div className="app-card">
                      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                          <div style={{ width:44,height:44,borderRadius:14,background:`${debt.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                            <span style={{ fontSize:18 }}>🧾</span>
                          </div>
                          <div>
                            <p style={{ fontSize:15,fontWeight:600,color:'var(--primary)',marginBottom:2 }}>{debt.name}</p>
                            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                              <span style={{ fontSize:12,padding:'2px 8px',borderRadius:20,background:done?'rgba(34,197,94,0.1)':'rgba(229,72,63,0.1)',color:done?'var(--success)':'var(--accent)',fontWeight:600 }}>
                                {done?'Abbezahlt':'Offen'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button onClick={()=>del(debt.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}>
                          <Trash2 width={16} height={16} style={{ color:'var(--tertiary)' }}/>
                        </button>
                      </div>

                      <p style={{ fontSize:28,fontWeight:800,color:done?'var(--success)':'var(--accent)',letterSpacing:'-0.02em',marginBottom:2 }}>
                        {done?'✓ Fertig!':fmt(left)+' offen'}
                      </p>
                      {!done && <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:12 }}>{fmt(debt.monthly_rate)} / Monat · {months?`−${months} Monate`:''}</p>}

                      <div style={{ height:6,borderRadius:3,background:'var(--bg)',overflow:'hidden',marginBottom:8 }}>
                        <div style={{ height:'100%',borderRadius:3,background:done?'var(--success)':debt.color,width:`${Math.min(pct,100)}%`,transition:'width 0.8s ease' }}/>
                      </div>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <p style={{ fontSize:12,color:'var(--tertiary)' }}>{pct.toFixed(0)}% abbezahlt</p>
                        {end && !done && (
                          <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                            <Calendar width={11} height={11} style={{ color:'var(--tertiary)' }}/>
                            <p style={{ fontSize:12,color:'var(--tertiary)' }}>{end}</p>
                          </div>
                        )}
                      </div>

                      {!done && (
                        <button onClick={()=>setShowPay(debt)}
                          style={{ marginTop:14,width:'100%',height:44,borderRadius:14,background:'rgba(229,72,63,0.08)',border:'1px solid rgba(229,72,63,0.15)',color:'var(--accent)',fontWeight:600,fontSize:14,cursor:'pointer' }}>
                          + Zahlung buchen
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div style={{ padding:'20px 20px 0' }}>
            <button onClick={()=>setAdd(true)}
              style={{ width:'100%',height:54,borderRadius:18,background:'var(--surface)',border:'1.5px dashed var(--border)',color:'var(--secondary)',fontWeight:600,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              <Plus width={18} height={18}/> Neuer Plan
            </button>
          </div>
        </>
      )}

      {showAdd  && <AddDebtSheet   onClose={()=>setAdd(false)}/>}
      {showPay  && <PaySheet debt={showPay} onClose={()=>setShowPay(null)}/>}
    </div>
  )
}

function AddDebtSheet({ onClose }: { onClose:()=>void }) {
  const { debts, setDebts, userId } = useStore()
  const [name,       setName]       = useState('')
  const [total,      setTotal]      = useState('')
  const [paid,       setPaid]       = useState('0')
  const [interest,   setInterest]   = useState('')
  const [monthly,    setMonthly]    = useState('')
  const [startMonth, setStartMonth] = useState(()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })
  const [category,   setCategory]   = useState(DEBT_CATEGORIES[0])
  const [color,      setColor]      = useState(DEBT_COLORS[0])
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  const previewEnd = useMemo(()=>{
    const t=parseFloat(total)||0, p=parseFloat(paid)||0, m=parseFloat(monthly)||0
    return t&&m ? calcEndDate(t,p,m,startMonth) : null
  },[total,paid,monthly,startMonth])

  const previewMonths = useMemo(()=>{
    const t=parseFloat(total)||0, p=parseFloat(paid)||0, m=parseFloat(monthly)||0
    return t&&m ? calcMonthsLeft(t,p,m) : null
  },[total,paid,monthly])

  async function save() {
    if (!name||!total) { setErr('Name und Betrag erforderlich.'); return }
    setSaving(true)
    const debt = { user_id:userId??'demo', name, total_amount:parseFloat(total), paid_amount:parseFloat(paid)||0, interest:parseFloat(interest)||0, monthly_rate:parseFloat(monthly)||0, due_date:startMonth||null, category, color }
    if (userId) {
      const { data:row, error } = await supabase.from('debts').insert(debt).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      if (row) setDebts([...debts, row as Debt])
    } else {
      setDebts([...debts, {...debt, id:Date.now().toString(), created_at:new Date().toISOString()} as Debt])
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Neuer Plan</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <input className="ak-input" placeholder="Bezeichnung (z.B. Autokredit)" value={name} onChange={e=>setName(e.target.value)}/>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Gesamtbetrag €" value={total} onChange={e=>setTotal(e.target.value)}/>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Bereits bezahlt €" value={paid} onChange={e=>setPaid(e.target.value)}/>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Zinssatz % p.a." value={interest} onChange={e=>setInterest(e.target.value)}/>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Monatsrate €" value={monthly} onChange={e=>setMonthly(e.target.value)}/>
          </div>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Startmonat</p>
            <input className="ak-input" type="month" value={startMonth} onChange={e=>setStartMonth(e.target.value)}/>
          </div>
          {previewEnd && (
            <div style={{ background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:10 }}>
              <Calendar width={16} height={16} style={{ color:'var(--success)',flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:'var(--success)' }}>Abbezahlt: {previewEnd}</p>
                <p style={{ fontSize:12,color:'var(--tertiary)' }}>in {previewMonths} Monaten</p>
              </div>
            </div>
          )}
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Kategorie</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {DEBT_CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCategory(c)} className={`cat-chip ${category===c?'selected':''}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Farbe</p>
            <div style={{ display:'flex',gap:8 }}>
              {DEBT_COLORS.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{ width:28,height:28,borderRadius:'50%',background:c,border:'none',cursor:'pointer',outline:color===c?`3px solid ${c}`:undefined,outlineOffset:2 }}/>
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

function PaySheet({ debt, onClose }: { debt:Debt; onClose:()=>void }) {
  const { debts, setDebts, userId } = useStore()
  const [amount, setAmount] = useState(String(debt.monthly_rate||''))
  const [saving, setSaving] = useState(false)
  const left = debt.total_amount - debt.paid_amount

  const newEnd = useMemo(()=>{
    const pay=parseFloat(amount)||0
    return calcEndDate(debt.total_amount, debt.paid_amount+pay, debt.monthly_rate, debt.due_date??'')
  },[amount,debt])

  const newMonths = useMemo(()=>{
    const pay=parseFloat(amount)||0
    return calcMonthsLeft(debt.total_amount, debt.paid_amount+pay, debt.monthly_rate)
  },[amount,debt])

  async function save() {
    const pay=Math.min(parseFloat(amount)||0,left)
    if (pay<=0) return
    setSaving(true)
    const newPaid=debt.paid_amount+pay
    if (userId) await supabase.from('debts').update({paid_amount:newPaid}).eq('id',debt.id)
    setDebts(debts.map(d=>d.id===debt.id?{...d,paid_amount:newPaid}:d))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Zahlung</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <div style={{ background:'var(--bg)',borderRadius:16,padding:'14px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:`${debt.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🧾</div>
          <div>
            <p style={{ fontSize:15,fontWeight:600,color:'var(--primary)' }}>{debt.name}</p>
            <p style={{ fontSize:13,color:'var(--tertiary)' }}>Offen: {fmt(left)}</p>
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <input className="ak-input" type="number" inputMode="decimal" placeholder="Betrag €" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <div style={{ display:'flex',gap:8 }}>
            {[debt.monthly_rate,left].filter(v=>v>0).map(v=>(
              <button key={v} onClick={()=>setAmount(String(v))}
                style={{ flex:1,padding:'10px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border)',color:'var(--secondary)',fontWeight:500,fontSize:13,cursor:'pointer' }}>
                {fmt(v)}
              </button>
            ))}
          </div>
          {newEnd && parseFloat(amount)>0 && (
            <div style={{ background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:10 }}>
              <Calendar width={16} height={16} style={{ color:'var(--success)',flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:'var(--success)' }}>Nach Zahlung: {newEnd}</p>
                <p style={{ fontSize:12,color:'var(--tertiary)' }}>noch {newMonths} Monate</p>
              </div>
            </div>
          )}
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Buche...':'Zahlung buchen'}</button>
        </div>
      </div>
    </div>
  )
}
