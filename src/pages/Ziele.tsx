import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, Target, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)

function fireConfetti() {
  confetti({ particleCount:120, spread:70, origin:{ y:0.6 }, colors:['#E5483F','#F59E0B','#22C55E'] })
}

export function ZielePage() {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setAdd]   = useState(false)
  const [dep, setDep]       = useState<Record<string,string>>({})
  const [done, setDone]     = useState<string|null>(null)

  const totalTarget  = goals.reduce((s,g)=>s+g.target_amount,0)
  const totalCurrent = goals.reduce((s,g)=>s+g.current_amount,0)

  async function deposit(id: string) {
    const g = goals.find(g=>g.id===id); if (!g) return
    const amount = parseFloat(dep[id]||'0'); if (!amount) return
    const wasComplete = g.current_amount >= g.target_amount
    const newCurrent  = Math.min(g.target_amount, g.current_amount+amount)
    if (userId) await supabase.from('savings_goals').update({current_amount:newCurrent}).eq('id',id)
    setGoals(goals.map(g=>g.id===id?{...g,current_amount:newCurrent}:g))
    setDep(d=>({...d,[id]:''}))
    if (!wasComplete && newCurrent>=g.target_amount) { setDone(id); fireConfetti(); setTimeout(()=>setDone(null),4000) }
  }

  async function del(id: string) {
    if (userId) await supabase.from('savings_goals').delete().eq('id',id)
    setGoals(goals.filter(g=>g.id!==id))
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">Sparziele</h1>
        <button onClick={()=>setAdd(true)}
          style={{ width:44,height:44,borderRadius:14,background:'var(--accent)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:4 }}>
          <Plus width={20} height={20} style={{ color:'white' }}/>
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <div className="app-card">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
              <div>
                <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:4 }}>Zielübersicht</p>
                <p style={{ fontSize:28,fontWeight:800,color:'var(--success)',letterSpacing:'-0.02em' }}>{fmt(totalCurrent)}</p>
                <p style={{ fontSize:13,color:'var(--tertiary)' }}>von {fmt(totalTarget)}</p>
              </div>
              <div style={{ width:48,height:48,borderRadius:14,background:'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Target width={24} height={24} style={{ color:'var(--success)' }}/>
              </div>
            </div>
            <div style={{ height:8,borderRadius:4,background:'var(--bg)',overflow:'hidden' }}>
              <motion.div style={{ height:'100%',borderRadius:4,background:'var(--success)' }}
                initial={{width:0}} animate={{width:`${totalTarget>0?Math.min((totalCurrent/totalTarget)*100,100):0}%`}} transition={{duration:1}}/>
            </div>
            <p style={{ fontSize:12,color:'var(--tertiary)',marginTop:6 }}>
              {totalTarget>0?((totalCurrent/totalTarget)*100).toFixed(0):0}% erreicht · {goals.length} Ziele
            </p>
            <div style={{
              marginTop:12,
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              padding:'10px 12px',
              borderRadius:12,
              background:'var(--bg)'
            }}>
              <span style={{ fontSize:12, color:'var(--secondary)' }}>Noch offen</span>
              <strong style={{ color:'var(--primary)' }}>{fmt(Math.max(0,totalTarget-totalCurrent))}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Ziele Liste */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {goals.length===0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',gap:12 }}>
            <Target width={48} height={48} style={{ color:'var(--tertiary)',opacity:0.3 }}/>
            <p style={{ fontSize:15,color:'var(--tertiary)',textAlign:'center' }}>Noch keine Sparziele definiert.</p>
            <button onClick={()=>setAdd(true)} className="btn-primary" style={{ width:'auto',padding:'0 24px' }}>
              Erstes Ziel erstellen
            </button>
          </div>
        ) : goals.map((goal, i) => {
          const pct       = goal.target_amount>0?Math.min(100,(goal.current_amount/goal.target_amount)*100):0
          const completed = goal.current_amount>=goal.target_amount
          const isDone    = done===goal.id
          return (
            <motion.div key={goal.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
              <div className="app-card">
                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:52,height:52,borderRadius:16,background:completed?'rgba(34,197,94,0.1)':'rgba(229,72,63,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>
                      {completed ? '🏆' : '🎯'}
                    </div>
                    <div>
                      <p style={{ fontSize:16,fontWeight:700,color:'var(--primary)' }}>{goal.name}</p>
                      {completed && (
                        <span style={{
                          display:'inline-block',
                          marginTop:4,
                          padding:'2px 8px',
                          borderRadius:999,
                          background:'rgba(34,197,94,0.12)',
                          color:'var(--success)',
                          fontSize:11,
                          fontWeight:700
                        }}>
                          Abgeschlossen
                        </span>
                      )}
                      {goal.deadline && <p style={{ fontSize:12,color:'var(--tertiary)' }}>bis {new Date(goal.deadline).toLocaleDateString('de-DE',{month:'long',year:'numeric'})}</p>}
                    </div>
                  </div>
                  <button onClick={()=>del(goal.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}>
                    <Trash2 width={16} height={16} style={{ color:'var(--tertiary)' }}/>
                  </button>
                </div>

                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8 }}>
                  <span style={{ fontSize:24,fontWeight:800,color:completed?'var(--success)':'var(--primary)',letterSpacing:'-0.02em' }}>{fmt(goal.current_amount)}</span>
                  <span style={{ fontSize:14,color:'var(--tertiary)' }}>von {fmt(goal.target_amount)}</span>
                </div>

                <div style={{ height:8,borderRadius:4,background:'var(--bg)',overflow:'hidden',marginBottom:6 }}>
                  <motion.div style={{ height:'100%',borderRadius:4,background:completed?'var(--success)':'var(--accent)' }}
                    initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,delay:i*0.1}}/>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:16 }}>
                  <p style={{ fontSize:12,color:'var(--tertiary)' }}>Fortschritt: {pct.toFixed(0)}%</p>
                  {!completed && <p style={{ fontSize:12,color:'var(--tertiary)' }}>{fmt(goal.target_amount-goal.current_amount)} fehlen noch</p>}
                </div>

                {isDone && (
                  <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                    style={{ background:'rgba(34,197,94,0.1)',borderRadius:12,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:8 }}>
                    <Trophy width={16} height={16} style={{ color:'var(--success)' }}/>
                    <p style={{ fontSize:14,fontWeight:600,color:'var(--success)' }}>Ziel erreicht! 🎉</p>
                  </motion.div>
                )}

                {!completed && (
                  <div style={{ display:'flex',gap:8 }}>
                    <input className="ak-input" type="number" inputMode="decimal" placeholder="Betrag €"
                      style={{ height:44,flex:1 }}
                      value={dep[goal.id]??''} onChange={e=>setDep(d=>({...d,[goal.id]:e.target.value}))}/>
                    <div style={{ display:'flex',gap:6 }}>
                      {[25,50,100].map(v=>(
                        <button key={v} onClick={()=>setDep(d=>({...d,[goal.id]:String(v)}))}
                          style={{ height:44,padding:'0 10px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border)',color:'var(--secondary)',fontSize:12,fontWeight:500,cursor:'pointer',whiteSpace:'nowrap' }}>
                          +{v}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>deposit(goal.id)}
                      style={{ height:44,padding:'0 16px',borderRadius:12,background:'var(--accent)',border:'none',color:'white',fontWeight:600,fontSize:14,cursor:'pointer',whiteSpace:'nowrap' }}>
                      ✓
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ height:20 }}/>
      {showAdd && <AddSheet onClose={()=>setAdd(false)}/>}
    </div>
  )
}

function AddSheet({ onClose }: { onClose:()=>void }) {
  const { goals, setGoals, userId } = useStore()
  const [name,     setName]     = useState('')
  const [target,   setTarget]   = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  async function save() {
    if (!name||!target) { setErr('Name und Zielbetrag erforderlich.'); return }
    setSaving(true)
    const goal = { user_id:userId??'demo', name, target_amount:parseFloat(target), current_amount:0, deadline:deadline||null }
    if (userId) {
      const { data:row, error } = await supabase.from('savings_goals').insert(goal).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, {...goal, id:Date.now().toString(), created_at:new Date().toISOString()}])
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Neues Sparziel</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <input className="ak-input" placeholder="Name (z.B. Notgroschen)" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="ak-input" type="number" inputMode="decimal" placeholder="Zielbetrag in €" value={target} onChange={e=>setTarget(e.target.value)}/>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Deadline (optional)</p>
            <input className="ak-input" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
          </div>
          {err && <p style={{ fontSize:13,color:'var(--danger)',background:'rgba(239,68,68,0.08)',padding:'10px 14px',borderRadius:12 }}>{err}</p>}
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Speichern...':'Erstellen'}</button>
        </div>
      </div>
    </div>
  )
}
