import { motion } from 'framer-motion'
import { useStore } from '../store'
import { ACHIEVEMENT_DEFS } from '../lib/supabase'
import { Trophy, Flame, Star, Lock } from 'lucide-react'

export function GamificationPage() {
  const { achievements, profile } = useStore()
  const xp           = (profile as any)?.xp    ?? 0
  const level        = (profile as any)?.level ?? 1
  const xpToNext     = level * 100
  const xpPct        = Math.min(100, Math.round(xp / xpToNext * 100))
  const unlockedKeys = new Set(achievements.map((a: any) => a.key))
  const streak       = parseInt(localStorage.getItem(`streak_count_${(profile as any)?.id}`) ?? '0')
  const totalAchievements = ACHIEVEMENT_DEFS.length
  const completionPct     = Math.round((achievements.length / totalAchievements) * 100)

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Erfolge & Level</h1>
        <p style={{ fontSize:15, color:'var(--secondary)', marginTop:4 }}>Sammle XP und schalte Abzeichen frei.</p>
      </div>

      {/* Level Card */}
      <div style={{ padding:'0 20px 16px' }}>
        <div className="accent-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, position:'relative', zIndex:1 }}>
            <div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Dein Fortschritt</p>
              <p style={{ fontSize:42, fontWeight:800, color:'white', letterSpacing:'-0.04em', lineHeight:1 }}>Level {level}</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.8)', marginTop:4 }}>{xp} XP gesammelt</p>
            </div>
            <div style={{ width:56, height:56, borderRadius:18, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Trophy width={28} height={28} style={{ color:'white' }}/>
            </div>
          </div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Level {level}</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.9)', fontWeight:600 }}>{xpToNext} XP</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.2)', overflow:'hidden' }}>
              <motion.div style={{ height:'100%', borderRadius:4, background:'white' }}
                initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1 }}/>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:6 }}>
              Noch <span style={{ color:'white', fontWeight:700 }}>{Math.max(0, xpToNext - xp)} XP</span> bis Level {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:'0 20px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="app-card" style={{ padding:20, textAlign:'center' }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'rgba(229,72,63,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
            <Flame width={22} height={22} style={{ color:'var(--accent)' }}/>
          </div>
          <p style={{ fontSize:28, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.03em' }}>{streak}</p>
          <p style={{ fontSize:12, color:'var(--tertiary)', marginTop:2 }}>Tage Streak</p>
        </div>
        <div className="app-card" style={{ padding:20, textAlign:'center' }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'rgba(245,158,11,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
            <Star width={22} height={22} style={{ color:'var(--warning)' }}/>
          </div>
          <p style={{ fontSize:28, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.03em' }}>{achievements.length}</p>
          <p style={{ fontSize:12, color:'var(--tertiary)', marginTop:2 }}>Abzeichen</p>
        </div>
      </div>

      {/* Fortschritt */}
      <div style={{ padding:'0 20px 16px' }}>
        <div className="app-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <p style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>Abzeichen-Fortschritt</p>
            <p style={{ fontSize:20, fontWeight:800, color:'var(--warning)' }}>{completionPct}%</p>
          </div>
          <div style={{ height:8, borderRadius:4, background:'var(--bg)', overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', borderRadius:4, background:'var(--warning)', width:`${completionPct}%`, transition:'width 1s ease' }}/>
          </div>
          <p style={{ fontSize:13, color:'var(--tertiary)' }}>
            {achievements.length} von {totalAchievements} Abzeichen freigeschaltet
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{ padding:'0 20px 20px' }}>
        <p style={{ fontSize:20, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>Alle Abzeichen</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <motion.div key={def.key}
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1+i*0.04 }}
                className="app-card"
                style={{ textAlign:'center', padding:20, opacity: unlocked ? 1 : 0.45,
                         border: unlocked ? '1.5px solid rgba(245,158,11,0.3)' : '1px solid var(--border)' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>
                  {unlocked ? def.icon : <Lock width={24} height={24} style={{ color:'var(--tertiary)', margin:'0 auto' }}/>}
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>{def.label}</p>
                <p style={{ fontSize:12, color:'var(--secondary)', lineHeight:1.4 }}>{def.desc}</p>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--warning)', marginTop:8 }}>+{def.xp} XP</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
