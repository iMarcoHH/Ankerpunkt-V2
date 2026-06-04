import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const GOAL_COLORS  = ['#C8392B','#E8A832','#3D5166','#9AA0A6','#4a6d8c']
const GOAL_EMOJIS  = ['🎯','✈️','🏠','🚗','💻','📱','🏖️','💍','🎓','💪','🎸','🌍']

function fireConfetti() {
  const count = 200
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 }
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
  }
  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#C8392B','#E8A832'] })
  fire(0.2,  { spread: 60, colors: ['#C8392B','#E8A832','#ffffff'] })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#C8392B','#E8A832'] })
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1,  { spread: 120, startVelocity: 45 })
}

export function ZielePage() {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setAdd]  = useState(false)
  const [justDone, setDone] = useState<string|null>(null)
  const [form, setForm]    = useState({ name:'', target:'', deadline:'', emoji:'🎯', color:GOAL_COLORS[0] })
  const [deposits, setDep] = useState<Record<string,string>>({})

  async function handleAdd() {
    if (!form.name || !form.target) return
    const goal = { user_id:userId??'demo', name:form.name, target:parseFloat(form.target), current:0,
                   deadline:form.deadline||null, color:form.color, emoji:form.emoji }
    if (userId) {
      const { data: row } = await supabase.from('savings_goals').insert(goal).select().single()
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, { ...goal, id:Date.now().toString(), created_at:new Date().toISOString() }])
    }
    setForm({ name:'', target:'', deadline:'', emoji:'🎯', color:GOAL_COLORS[0] })
    setAdd(false)
  }

  async function handleDeposit(id: string) {
    const amount = Number(deposits[id]); if (!amount || amount <= 0) return
    const g = goals.find(g=>g.id===id); if (!g) return
    const wasComplete = g.current >= g.target
    const newCurrent  = Math.min(g.target, g.current + amount)
    const nowComplete = newCurrent >= g.target

    const updated = { ...g, current: newCurrent }
    if (userId) await supabase.from('savings_goals').update({ current: newCurrent }).eq('id', id)
    setGoals(goals.map(g => g.id===id ? updated : g))
    setDep(d => ({ ...d, [id]:'' }))

    if (!wasComplete && nowComplete) {
      setDone(id)
      fireConfetti()
      setTimeout(() => setDone(null), 4000)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ziel löschen?')) return
    if (userId) await supabase.from('savings_goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  return (
    <div className="p-5 space-y-4 pb-8">
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Ziele</h1>
          <p className="text-cement text-sm mt-0.5">Meilensteine im Blick</p>
        </div>
        <button onClick={() => setAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background:'#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl gap-4"
             style={{ border:'2px dashed rgba(61,81,102,0.4)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.1)' }}>
            <Target className="w-7 h-7" style={{ color:'#E8A832', opacity:0.6 }}/>
          </div>
          <p className="text-sm text-cement">Noch keine Ziele angelegt.</p>
          <button onClick={() => setAdd(true)} className="ak-btn ak-btn-secondary text-sm px-4 py-2 gap-2">
            <Plus className="w-4 h-4"/> Erstes Ziel setzen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const pct       = Math.min(100, (goal.current / goal.target) * 100)
            const completed = goal.current >= goal.target
            const isJust    = justDone === goal.id

            return (
              <motion.div key={goal.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
                className="ak-card p-5 group relative overflow-hidden"
                style={{ border: completed ? '1px solid rgba(232,168,50,0.4)' : undefined }}>

                {/* Confetti celebration banner */}
                <AnimatePresence>
                  {isJust && (
                    <motion.div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
                      style={{ background:'rgba(13,27,42,0.92)' }}
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <div className="text-center">
                        <div className="text-5xl mb-2">🎉</div>
                        <div className="font-display text-white text-2xl tracking-widest">ZIEL ERREICHT!</div>
                        <div className="text-cement text-sm mt-1">{goal.name}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                         style={{ background: completed ? 'rgba(232,168,50,0.15)' : 'rgba(61,81,102,0.3)' }}>
                      {(goal as any).emoji || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white leading-tight">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-cement mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/>
                          {new Date(goal.deadline).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {completed && <CheckCircle2 className="w-5 h-5" style={{ color:'#E8A832' }}/>}
                    <button onClick={() => handleDelete(goal.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background:'rgba(200,57,43,0.15)' }}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400"/>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-display tracking-wide"
                          style={{ color: completed ? '#E8A832' : '#E8DFD0' }}>
                      {fmt(goal.current)}
                    </span>
                    <span className="text-xs text-cement font-mono">von {fmt(goal.target)}</span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: completed ? '#E8A832' : (goal.color || '#C8392B') }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }}
                      transition={{ duration:0.8, delay:i*0.07+0.2, ease:'easeOut' }}/>
                  </div>
                  <div className="flex justify-between text-xs text-cement">
                    <span>{pct.toFixed(0)}% erreicht</span>
                    <span>{fmt(goal.target - goal.current)} fehlen noch</span>
                  </div>
                </div>

                {!completed && (
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop:'1px solid rgba(61,81,102,0.4)' }}>
                    <input placeholder="Betrag einzahlen..." type="number" className="ak-input h-9 text-sm flex-1"
                      value={deposits[goal.id] || ''}
                      onChange={e => setDep(d => ({ ...d, [goal.id]:e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleDeposit(goal.id)}/>
                    <div className="flex gap-1.5 shrink-0">
                      {[50,100,500].map(amt => (
                        <button key={amt} onClick={() => { setDep(d=>({...d,[goal.id]:String(amt)})); setTimeout(()=>handleDeposit(goal.id),50) }}
                          className="px-2 h-9 rounded-lg text-xs font-mono"
                          style={{ background:'rgba(232,168,50,0.12)', color:'#E8A832' }}>
                          +{amt}
                        </button>
                      ))}
                      <button onClick={() => handleDeposit(goal.id)}
                        disabled={!deposits[goal.id]}
                        className="flex items-center gap-1 px-2.5 h-9 rounded-lg font-display text-xs shrink-0 disabled:opacity-40"
                        style={{ background:'#E8A832', color:'#0D1B2A' }}>
                        <TrendingUp className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Sheet */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
            <div className="flex justify-between items-center mb-5">
              <span className="font-display text-white text-2xl">NEUES ZIEL</span>
              <button onClick={() => setAdd(false)} className="w-8 h-8 rounded-full text-cement flex items-center justify-center" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Emoji</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f=>({...f,emoji:e}))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                      style={{ background:form.emoji===e?'rgba(232,168,50,0.2)':'rgba(255,255,255,0.06)',
                               outline:form.emoji===e?'2px solid #E8A832':'none', outlineOffset:2 }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input className="ak-input" placeholder="Zielname (z.B. Urlaub Japan)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/>
              <input className="ak-input" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
              <div>
                <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Farbe</p>
                <div className="flex gap-2">
                  {GOAL_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className="w-8 h-8 rounded-full"
                      style={{ background:c, outline:form.color===c?`3px solid ${c}`:'none', outlineOffset:2 }}/>
                  ))}
                </div>
              </div>
              <button onClick={handleAdd} className="w-full ak-btn ak-btn-primary">Erstellen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
