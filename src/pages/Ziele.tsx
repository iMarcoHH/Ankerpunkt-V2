import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)

const GOAL_COLORS = ['#C8392B','#E8A832','#3D5166','#9AA0A6','#4a6d8c']
const GOAL_EMOJIS = ['🎯','✈️','🏠','🚗','💻','📱','🏖️','💍','🎓','💪']

export function ZielePage() {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '', emoji: '🎯', color: GOAL_COLORS[0] })
  const [deposits, setDeposits] = useState<Record<string, string>>({})

  async function handleAdd() {
    if (!form.name || !form.target) return
    const goal = { user_id: userId ?? 'demo', name: form.name, target: parseFloat(form.target), current: 0, deadline: form.deadline || null, color: form.color, emoji: form.emoji }
    if (userId) {
      const { data: row } = await supabase.from('savings_goals').insert(goal).select().single()
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, { ...goal, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name: '', target: '', deadline: '', emoji: '🎯', color: GOAL_COLORS[0] })
    setShowAdd(false)
  }

  async function handleDeposit(id: string) {
    const amount = Number(deposits[id]); if (!amount || amount <= 0) return
    const g = goals.find(g => g.id === id); if (!g) return
    const updated = { ...g, current: Math.min(g.target, g.current + amount) }
    if (userId) await supabase.from('savings_goals').update({ current: updated.current }).eq('id', id)
    setGoals(goals.map(g => g.id === id ? updated : g))
    setDeposits(d => ({ ...d, [id]: '' }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Ziel löschen?')) return
    if (userId) await supabase.from('savings_goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Ziele</h1>
          <p className="text-cement text-sm mt-1">Meilensteine im Blick behalten</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background: '#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl gap-4"
             style={{ border: '2px dashed rgba(61,81,102,0.4)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(232,168,50,0.1)' }}>
            <Target className="w-8 h-8" style={{ color: '#E8A832' }}/>
          </div>
          <p className="text-cement text-sm">Noch keine Ziele angelegt.</p>
          <button onClick={() => setShowAdd(true)} className="ak-btn ak-btn-secondary text-sm px-4 py-2 gap-2">
            <Plus className="w-4 h-4"/> Erstes Ziel setzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal, i) => {
            const progress    = Math.min(100, (goal.current / goal.target) * 100)
            const isCompleted = goal.current >= goal.target
            return (
              <motion.div key={goal.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.07 }}
                className="ak-card p-5 group" style={{ border: isCompleted ? '1px solid rgba(232,168,50,0.4)' : undefined }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                         style={{ background: isCompleted ? 'rgba(232,168,50,0.15)' : 'rgba(61,81,102,0.3)' }}>
                      {(goal as any).emoji || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white leading-tight">{goal.name}</h3>
                      {goal.deadline && <p className="text-xs text-cement mt-0.5">bis {new Date(goal.deadline).toLocaleDateString('de-DE')}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {isCompleted && <CheckCircle2 className="w-5 h-5 mr-1 self-center" style={{ color: '#E8A832' }}/>}
                    <button onClick={() => handleDelete(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-cement hover:text-red-400"
                      style={{ background: 'rgba(200,57,43,0.15)' }}>
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-display tracking-wide"
                          style={{ color: isCompleted ? '#E8A832' : '#E8DFD0' }}>
                      {fmt(goal.current)}
                    </span>
                    <span className="text-xs text-cement font-mono">von {fmt(goal.target)}</span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: isCompleted ? '#E8A832' : (goal.color || '#C8392B') }}
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: i*0.07+0.2, ease: 'easeOut' }}/>
                  </div>
                  <div className="flex justify-between text-xs text-cement">
                    <span>{progress.toFixed(0)}% erreicht</span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3"/>
                        {new Date(goal.deadline).toLocaleDateString('de-DE')}
                      </span>
                    )}
                  </div>
                </div>
                {!isCompleted && (
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(61,81,102,0.4)' }}>
                    <input placeholder="Betrag einzahlen..." type="number" className="ak-input h-9 text-sm flex-1"
                      value={deposits[goal.id] || ''}
                      onChange={e => setDeposits(d => ({ ...d, [goal.id]: e.target.value }))}/>
                    <button onClick={() => handleDeposit(goal.id)}
                      disabled={!deposits[goal.id]}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-display text-sm shrink-0 disabled:opacity-40"
                      style={{ background: '#E8A832', color: '#0D1B2A' }}>
                      <TrendingUp className="w-3.5 h-3.5"/> Einzahlen
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}/></div>
            <div className="flex justify-between items-center mb-5">
              <div className="font-display text-white text-2xl">NEUES ZIEL</div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full text-cement text-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>×</button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Emoji</div>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({...f, emoji: e}))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all"
                      style={{ background: form.emoji===e ? 'rgba(232,168,50,0.2)' : 'rgba(255,255,255,0.06)',
                               outline: form.emoji===e ? '2px solid #E8A832' : 'none', outlineOffset: 2 }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input className="ak-input" placeholder="Zielname (z.B. Urlaub Japan)" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €" value={form.target} onChange={e => setForm(f=>({...f,target:e.target.value}))}/>
              <input className="ak-input" type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))}/>
              <div>
                <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Farbe</div>
                <div className="flex gap-2">
                  {GOAL_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className="w-8 h-8 rounded-full transition-all"
                      style={{ background: c, outline: form.color===c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}/>
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
