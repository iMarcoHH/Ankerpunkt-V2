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
  const totalAchievements = ACHIEVEMENT_DEFS.length
  const completionPct = Math.round((achievements.length / totalAchievements) * 100)
  const bronzeCount = Math.min(achievements.length, 4)
  const silverCount = Math.max(0, Math.min(achievements.length - 4, 3))
  const goldCount = Math.max(0, Math.min(achievements.length - 7, 2))
  const diamondCount = Math.max(0, achievements.length - 9)

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Erfolge & Level</h1>
        <p className="text-white/75 text-sm mt-1">Baue langfristige Finanzgewohnheiten auf und sammle XP.</p>
      </div>

      <motion.div
        initial={{ opacity:0,y:12 }}
        animate={{ opacity:1,y:0 }}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background:'linear-gradient(135deg,#1A2434 0%,#223247 55%,#2B3D52 100%)',
          border:'1px solid rgba(232,168,50,0.15)'
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30"
          style={{ background:'#E8A832', filter:'blur(60px)' }}
        />

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-2">Dein Fortschritt</p>
            <h2 className="text-white text-5xl font-bold">Level {level}</h2>
            <p className="text-white text-base mt-1 font-medium">{xp} XP gesammelt</p>
          </div>

          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ background:'rgba(232,168,50,0.18)' }}
          >
            <Trophy className="w-8 h-8" style={{ color:'#E8A832' }} />
          </div>
        </div>

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-white/80">Level {level}</span>
          <span style={{ color:'#E8A832' }}>{xpToNext} XP</span>
        </div>

        <div className="h-4 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background:'linear-gradient(90deg,#E8A832,#F5C15A)' }}
            initial={{ width:0 }}
            animate={{ width:`${xpPct}%` }}
            transition={{ duration:1 }}
          />
        </div>

        <p className="text-white/70 text-sm mt-3">
          Noch <span style={{ color:'#E8A832', fontWeight:700 }}>{Math.max(0, xpToNext - xp)} XP</span> bis Level {level + 1}
        </p>
      </motion.div>

      {/* Streak + count */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="ak-card p-5 flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(200,57,43,0.15)' }}>
            <Flame className="w-5 h-5 text-red"/>
          </div>
          <p className="text-4xl font-display tracking-wide text-white">{streak}</p>
          <p className="text-xs text-white/60 uppercase tracking-wider">Tage Streak</p>
        </motion.div>
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          className="ak-card p-5 flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.15)' }}>
            <Star className="w-5 h-5" style={{ color:'#E8A832' }}/>
          </div>
          <p className="text-4xl font-display tracking-wide text-white">{achievements.length}</p>
          <p className="text-xs text-white/60 uppercase tracking-wider">Abzeichen</p>
        </motion.div>
      </div>

      <div className="ak-card p-5">
        <p className="text-white text-lg font-semibold mb-2">🎯 Nächstes Level</p>
        <p className="text-white/80 text-sm">
          Noch {Math.max(0, xpToNext - xp)} XP bis Level {level + 1}.
        </p>
      </div>

      <motion.div
        initial={{ opacity:0,y:12 }}
        animate={{ opacity:1,y:0 }}
        transition={{ delay:0.18 }}
        className="ak-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white text-sm font-semibold">Abzeichen-Fortschritt</p>
            <p className="text-white text-2xl font-semibold">{completionPct}%</p>
          </div>
          <Trophy className="w-8 h-8" style={{ color:'#E8A832' }} />
        </div>

        <div className="h-3 rounded-full overflow-hidden" style={{ background:'rgba(61,81,102,0.4)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width:`${completionPct}%`,
              background:'linear-gradient(90deg,#E8A832,#f0b84a)'
            }}
          />
        </div>

        <p className="text-white text-sm mt-3">
          {achievements.length} von {totalAchievements} Abzeichen freigeschaltet
        </p>
      </motion.div>

      {/* Badges grid */}
      <div>
        <h2 className="font-display text-2xl tracking-widest text-white mb-3">Erfolge & Abzeichen</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <motion.div key={def.key} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2+i*0.05 }}
                className="ak-card p-5 flex flex-col items-center text-center gap-3"
                style={{ border: unlocked ? '1px solid rgba(232,168,50,0.3)' : '1px solid rgba(255,255,255,0.08)', opacity: unlocked ? 1 : 0.75 }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                     style={{ background: unlocked ? 'rgba(232,168,50,0.15)' : 'rgba(61,81,102,0.3)' }}>
                  {unlocked ? def.icon : <Lock className="w-5 h-5 text-white/60"/>}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white leading-snug">{def.label}</p>
                  <p className="text-sm text-white mt-2 leading-relaxed">{def.desc}</p>
                  {!unlocked && (
                    <p className="text-[10px] mt-2" style={{ color:'#E8A832' }}>
                      Belohnung: +{def.xp} XP
                    </p>
                  )}
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
