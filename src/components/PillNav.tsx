import { useRef } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Trophy, Calculator, Newspaper, BookOpen, LogOut,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export const ALL_TABS = [
  { id: 'dashboard',      label: 'Dashboard',      Icon: LayoutDashboard },
  { id: 'buchungen',      label: 'Buchungen',       Icon: ListOrdered     },
  { id: 'analysen',       label: 'Analysen',        Icon: PieChart        },
  { id: 'ziele',          label: 'Ziele',           Icon: Target          },
  { id: 'versicherungen', label: 'Versicherungen',  Icon: Shield          },
  { id: 'gamification',   label: 'Erfolge',         Icon: Trophy          },
  { id: 'rechner',        label: 'Rechner',         Icon: Calculator      },
  { id: 'news',           label: 'News',            Icon: Newspaper       },
  { id: 'lexikon',        label: 'Lexikon',         Icon: BookOpen        },
]

export const ALL_TAB_IDS = ALL_TABS.map(t => t.id)

// First 4 in pill, rest accessible via swipe only
const PILL_TABS = ALL_TABS.slice(0, 4)

export function PillNav() {
  const { activeTab, setActiveTab, setUserId, setTransactions, setInsurances, setGoals, setAchievements, setProfile } = useStore()
  const [showAll, setShowAll] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null)
  }

  const currentIdx = ALL_TAB_IDS.indexOf(activeTab)
  const isMainTab  = currentIdx < 4

  return (
    <>
      {/* All-tabs drawer */}
      <AnimatePresence>
        {showAll && (
          <>
            <motion.div className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAll(false)}/>
            <motion.div className="fixed z-50 w-[calc(100%-2rem)] max-w-sm"
              style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))', left: '50%' }}
              initial={{ opacity:0, y:16, scale:0.95, x:'-50%' }}
              animate={{ opacity:1, y:0,  scale:1,    x:'-50%' }}
              exit={{ opacity:0, y:16, scale:0.95, x:'-50%' }}
              transition={{ type:'spring', stiffness:400, damping:30 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl"
                   style={{ background:'#0D1B2A', border:'1px solid rgba(61,81,102,0.6)' }}>
                <div className="flex items-center justify-between px-4 py-3"
                     style={{ borderBottom:'1px solid rgba(61,81,102,0.4)' }}>
                  <span className="font-display text-lg tracking-widest text-white">ALLE SEITEN</span>
                  <button onClick={() => setShowAll(false)} className="text-cement text-xl leading-none">×</button>
                </div>
                <div className="grid grid-cols-4 gap-px" style={{ background:'rgba(61,81,102,0.2)' }}>
                  {ALL_TABS.map(tab => {
                    const active = activeTab === tab.id
                    return (
                      <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setShowAll(false) }}
                        className="flex flex-col items-center gap-1.5 py-3 px-1 transition-colors"
                        style={{ background: active ? 'rgba(200,57,43,0.15)' : '#0D1B2A',
                                 color: active ? '#C8392B' : '#9AA0A6' }}>
                        <tab.Icon className="w-5 h-5"/>
                        <span className="text-[9px] font-medium tracking-wide leading-tight text-center">{tab.label}</span>
                      </button>
                    )
                  })}
                  <button onClick={handleLogout}
                    className="flex flex-col items-center gap-1.5 py-3 px-1"
                    style={{ background:'#0D1B2A', color:'#9AA0A6' }}>
                    <LogOut className="w-5 h-5"/>
                    <span className="text-[9px] font-medium tracking-wide">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating pill */}
      <div className="fixed z-50 left-1/2"
           style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))', transform: 'translateX(-50%)' }}>
        <motion.div
          className="flex items-center gap-0.5 rounded-full px-1.5 py-1.5 shadow-2xl"
          style={{ background:'rgba(13,27,42,0.95)', border:'1px solid rgba(61,81,102,0.6)', backdropFilter:'blur(16px)' }}
          initial={{ y:100, opacity:0 }}
          animate={{ y:0,   opacity:1 }}
          transition={{ type:'spring', stiffness:300, damping:30, delay:0.1 }}>

          {PILL_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <motion.button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-colors"
                style={{ color: active ? 'white' : '#9AA0A6' }}
                whileTap={{ scale: 0.92 }}>
                {active && (
                  <motion.div className="absolute inset-0 rounded-full" style={{ background:'#C8392B' }}
                    layoutId="pill-active"
                    transition={{ type:'spring', stiffness:400, damping:30 }}/>
                )}
                <tab.Icon className="w-4 h-4 relative z-10"/>
                <span className="text-[8px] font-medium tracking-wide relative z-10 leading-none">{tab.label}</span>
              </motion.button>
            )
          })}

          {/* Divider */}
          <div className="w-px h-6 mx-0.5" style={{ background:'rgba(61,81,102,0.6)' }}/>

          {/* Current non-main tab indicator OR grid button */}
          {!isMainTab ? (
            <motion.button
              onClick={() => setShowAll(v => !v)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-full"
              style={{ color: 'white' }}
              whileTap={{ scale: 0.92 }}>
              <motion.div className="absolute inset-0 rounded-full" style={{ background:'#C8392B' }}
                layoutId="pill-active"
                transition={{ type:'spring', stiffness:400, damping:30 }}/>
              {(() => { const T = ALL_TABS.find(t => t.id === activeTab); return T ? <T.Icon className="w-4 h-4 relative z-10"/> : null })()}
              <span className="text-[8px] font-medium tracking-wide relative z-10 leading-none">
                {ALL_TABS.find(t => t.id === activeTab)?.label ?? 'Mehr'}
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setShowAll(v => !v)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-full"
              style={{ color: '#9AA0A6' }}
              whileTap={{ scale: 0.92 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
              </svg>
              <span className="text-[8px] font-medium tracking-wide leading-none">Mehr</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  )
}

// SwipeContainer
export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  return (
    <div
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
        const idx = ALL_TAB_IDS.indexOf(activeTab)
        if (dx < 0 && idx < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[idx + 1])
        else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx - 1])
      }}
    >
      {children}
    </div>
  )
}
