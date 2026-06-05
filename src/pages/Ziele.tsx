import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)

function fireConfetti() {
  const c = 200, d = { origin: { y: 0.7 }, zIndex: 9999 }
  const f = (r: number, o: confetti.Options) => confetti({ ...d, ...o, particleCount: Math.floor(c * r) })
  f(0.25, { spread: 26, startVelocity: 55, colors: ['#C8392B','#E8A832'] })
  f(0.2,  { spread: 60, colors: ['#C8392B','#E8A832','#ffffff'] })
  f(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#C8392B','#E8A832'] })
  f(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  f(0.1,  { spread: 120, startVelocity: 45 })
}

export function ZielePage() {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setAdd]   = useState(false)
  const [justDone, setDone] = useState<string|null>(null)
  const [name, setName]     = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deposits, setDep]  = useState<Record<string,string>>({})
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name || !target) return
    setSaving(true)
    // Nur Felder die definitiv in der Tabelle existieren
    const goal = {
      user_id:  userId ?? 'demo',
      name,
      target_amount: parseFloat(target),
      current_amount: 0,
      deadline: deadline || null,
    }
    if (userId) {
      const { data: row, error } = await supabase.from('savings_goals').insert(goal).select().single()
      if (error) { console.error('Ziel Fehler:', error); alert('Fehler: ' + error.message); setSaving(false); return }
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, { ...goal, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setName(''); setTarget(''); setDeadline('')
    setAdd(false); setSaving(false)
  }

  async function handleDeposit(id: string) {
    const amount = Number(deposits[id]); if (!amount || amount <= 0) return
    const g = goals.find(g => g.id === id); if (!g) return
    const wasComplete = g.current_amount >= g.target_amount
    const newCurrent  = Math.min(g.target_amount, g.current_amount + amount)
    if (userId) await supabase.from('savings_goals').update({ current_amount: newCurrent }).eq('id', id)
    setGoals(goals.map(g => g.id === id ? { ...g, current_amount: newCurrent } : g))
    setDep(d => ({ ...d, [id]: '' }))
    if (!wasComplete && newCurrent >= g.target_amount) {
      setDone(id); fireConfetti(); setTimeout(() => setDone(null), 4000)
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
          <Target className="w-10 h-10" style={{ color:'#E8A832', opacity:0.5 }}/>
          <p className="text-sm text-cement">Noch keine Ziele angelegt.</p>
          <button onClick={() => setAdd(true)} className="ak-btn ak-btn-secondary text-sm px-4 py-2">
            <Plus className="w-4 h-4"/> Erstes Ziel setzen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const pct       = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0
            const completed = goal.current_amount >= goal.target_amount
            return (
              <motion.div key={goal.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
                className="ak-card p-5 group relative overflow-hidden"
                style={{ border: completed ? '1px solid rgba(232,168,50,0.4)' : undefined }}>

                <AnimatePresence>
                  {justDone === goal.id && (
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
                      🎯
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
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background:'rgba(200,57,43,0.15)' }}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400"/>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-display tracking-wide"
                    style={{ color: completed ? '#E8A832' : '#E8DFD0' }}>
                    {fmt(goal.current_amount)}
                    </span>
                    <span className="text-xs text-cement font-mono">von {fmt(goal.target_amount)}</span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: completed ? '#E8A832' : '#C8392B' }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }}
                      transition={{ duration:0.8, delay:i*0.07+0.2, ease:'easeOut' }}/>
                  </div>
                  <div className="flex justify-between text-xs text-cement">
                    <span>{pct.toFixed(0)}% erreicht</span>
                    <span>{fmt(goal.target_amount - goal.current_amount)} fehlen noch</span>
                  </div>
                </div>

                {!completed && (
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop:'1px solid rgba(61,81,102,0.4)' }}>
                    <input placeholder="Betrag einzahlen..." type="number" className="ak-input h-9 text-sm flex-1"
                      value={deposits[goal.id] || ''}
                      onChange={e => setDep(d => ({ ...d, [goal.id]: e.target.value }))}
                      onKeyDown={e => e.key==='Enter' && handleDeposit(goal.id)}/>
                    <div className="flex gap-1.5 shrink-0">
                      {[50,100,500].map(amt => (
                        <button key={amt}
                          onClick={() => { setDep(d=>({...d,[goal.id]:String(amt)})); setTimeout(()=>handleDeposit(goal.id),50) }}
                          className="px-2 h-9 rounded-lg text-xs font-mono"
                          style={{ background:'rgba(232,168,50,0.12)', color:'#E8A832' }}>
                          +{amt}
                        </button>
                      ))}
                      <button onClick={() => handleDeposit(goal.id)} disabled={!deposits[goal.id]}
                        className="flex items-center px-2.5 h-9 rounded-lg disabled:opacity-40"
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

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-display text-white text-xl">NEUES ZIEL</span>
              <button onClick={() => setAdd(false)} className="w-7 h-7 rounded-full text-cement flex items-center justify-center" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
            </div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Zielname (z.B. Urlaub Japan)"
                value={name} onChange={e => setName(e.target.value)} autoFocus/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €"
                value={target} onChange={e => setTarget(e.target.value)}/>
              <input className="ak-input" type="date"
                value={deadline} onChange={e => setDeadline(e.target.value)}/>
              <button onClick={handleAdd} disabled={saving || !name || !target}
                className="w-full ak-btn ak-btn-primary disabled:opacity-50">
                {saving ? 'Speichern...' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
