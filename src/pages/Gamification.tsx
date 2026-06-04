import { motion } from 'framer-motion'
import { useStore } from '../store'
import { ACHIEVEMENT_DEFS } from '../lib/supabase'
import { Trophy, Flame, Star, Lock } from 'lucide-react'

export function GamificationPage() {
  const { achievements, profile } = useStore()
  const xp        = profile?.xp    ?? 0
  const level     = profile?.level ?? 1
  const xpToNext  = level * 100
  const xpPct     = Math.min(100, Math.round(xp / xpToNext * 100))
  const unlockedKeys = new Set(achievements.map(a => a.key))
  const streak    = 0 // TODO: streak tracking

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Erfolge & Level</h1>
        <p className="text-cement text-sm mt-1">Disziplin zahlt sich aus.</p>
      </div>

      {/* Level card */}
      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #162030 0%, #1e2e40 60%, #243444 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
             style={{ background:'#E8A832', filter:'blur(50px)', transform:'translate(20%,-20%)' }}/>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(232,168,50,0.2)' }}>
            <Trophy className="w-6 h-6" style={{ color: '#E8A832' }}/>
          </div>
          <div>
            <p className="text-xs text-cement uppercase tracking-widest">Aktuelles Level</p>
            <p className="text-3xl font-display tracking-wide text-white">Level {level}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-mono font-semibold" style={{ color: '#E8A832' }}>{xp} XP</span>
            <span className="text-cement font-mono">{xpToNext} XP</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(61,81,102,0.4)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #E8A832, #f0b84a)' }}
              initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}/>
          </div>
          <p className="text-xs text-cement">Noch {xpToNext - xp} XP bis Level {level + 1}</p>
        </div>
      </motion.div>

      {/* Streak + count */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="ak-card p-5 flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(200,57,43,0.15)' }}>
            <Flame className="w-5 h-5 text-red"/>
          </div>
          <p className="text-4xl font-display tracking-wide text-white">{streak}</p>
          <p className="text-xs text-cement uppercase tracking-wider">Tage Streak</p>
        </motion.div>
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          className="ak-card p-5 flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.15)' }}>
            <Star className="w-5 h-5" style={{ color:'#E8A832' }}/>
          </div>
          <p className="text-4xl font-display tracking-wide text-white">{achievements.length}</p>
          <p className="text-xs text-cement uppercase tracking-wider">Abzeichen</p>
        </motion.div>
      </div>

      {/* Badges grid */}
      <div>
        <h2 className="font-display text-2xl tracking-widest text-white mb-3">Abzeichen</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <motion.div key={def.key} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2+i*0.05 }}
                className="ak-card p-4 flex flex-col items-center text-center gap-3"
                style={{ border: unlocked ? '1px solid rgba(232,168,50,0.3)' : undefined, opacity: unlocked ? 1 : 0.5 }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                     style={{ background: unlocked ? 'rgba(232,168,50,0.15)' : 'rgba(61,81,102,0.3)' }}>
                  {unlocked ? def.icon : <Lock className="w-5 h-5 text-cement"/>}
                </div>
                <div>
                  <p className="font-semibold text-xs text-white leading-snug">{def.label}</p>
                  <p className="text-[10px] text-cement mt-1 leading-snug">{def.desc}</p>
                </div>
                {unlocked && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background:'rgba(232,168,50,0.15)', color:'#E8A832' }}>
                    +{def.xp} XP
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
