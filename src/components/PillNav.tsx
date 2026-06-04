import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Trophy, Calculator, Newspaper, BookOpen,
  StickyNote, LogOut, X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export const ALL_TABS = [
  { id: 'dashboard',      label: 'Dashboard',     Icon: LayoutDashboard },
  { id: 'buchungen',      label: 'Buchungen',      Icon: ListOrdered     },
  { id: 'analysen',       label: 'Analysen',       Icon: PieChart        },
  { id: 'ziele',          label: 'Ziele',          Icon: Target          },
  { id: 'versicherungen', label: 'Versicherungen', Icon: Shield          },
  { id: 'gamification',   label: 'Erfolge',        Icon: Trophy          },
  { id: 'rechner',        label: 'Rechner',        Icon: Calculator      },
  { id: 'news',           label: 'News',           Icon: Newspaper       },
  { id: 'notizen',        label: 'Notizen',        Icon: StickyNote      },
  { id: 'lexikon',        label: 'Lexikon',        Icon: BookOpen        },
]

export const ALL_TAB_IDS = ALL_TABS.map(t => t.id)

// Visible in pill — 4 main tabs + scrollable via pill swipe
const PILL_TABS = ALL_TABS.slice(0, 4)

export function PillNav() {
  const { activeTab, setActiveTab, setUserId, setTransactions, setInsurances, setGoals, setAchievements, setProfile } = useStore()
  const [showGrid, setShowGrid] = useState(false)

  // Pill swipe
  const pillTouchX = useRef(0)
  const pillIdx    = ALL_TAB_IDS.indexOf(activeTab)

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null)
  }

  const activeTab_obj = ALL_TABS.find(t => t.id === activeTab)
  const isMainTab     = pillIdx < 4

  return (
    <>
      {/* Grid overlay */}
      <AnimatePresence>
        {showGrid && (
          <>
            <motion.div className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowGrid(false)}
            />
            <motion.div
              className="fixed z-50 w-[calc(100%-2rem)] max-w-xs"
              style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom,0px))', left: '50%' }}
              initial={{ opacity:0, y:12, scale:0.95, x:'-50%' }}
              animate={{ opacity:1, y:0,  scale:1,    x:'-50%' }}
              exit={{ opacity:0, y:12, scale:0.95, x:'-50%' }}
              transition={{ type:'spring', stiffness:420, damping:32 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl"
                   style={{ background:'#0D1B2A', border:'1px solid rgba(61,81,102,0.6)' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                     style={{ borderBottom:'1px solid rgba(61,81,102,0.4)' }}>
                  <span className="font-display text-base tracking-widest text-white">ALLE SEITEN</span>
                  <button onClick={() => setShowGrid(false)} className="text-cement"><X className="w-4 h-4"/></button>
                </div>
                <div className="grid grid-cols-4 gap-px" style={{ background:'rgba(61,81,102,0.2)' }}>
                  {ALL_TABS.map(tab => {
                    const active = activeTab === tab.id
                    return (
                      <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setShowGrid(false) }}
                        className="flex flex-col items-center gap-1 py-3 px-1 transition-colors"
                        style={{ background: active?'rgba(200,57,43,0.15)':'#0D1B2A', color: active?'#C8392B':'#9AA0A6' }}>
                        <tab.Icon className="w-5 h-5"/>
                        <span className="text-[9px] font-medium text-center leading-tight">{tab.label}</span>
                      </button>
                    )
                  })}
                  <button onClick={handleLogout}
                    className="flex flex-col items-center gap-1 py-3 px-1"
                    style={{ background:'#0D1B2A', color:'#9AA0A6' }}>
                    <LogOut className="w-5 h-5"/>
                    <span className="text-[9px] font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pill */}
      <div
        className="fixed z-50 left-1/2"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom,0.75rem))', transform:'translateX(-50%)' }}>
        <motion.div
          className="flex items-center rounded-full shadow-2xl"
          style={{ background:'rgba(13,27,42,0.96)', border:'1px solid rgba(61,81,102,0.55)', backdropFilter:'blur(20px)', padding:'5px 6px', gap: 2 }}
          initial={{ y:80, opacity:0 }}
          animate={{ y:0,  opacity:1 }}
          transition={{ type:'spring', stiffness:300, damping:28, delay:0.1 }}
          /* Pill swipe */
          onTouchStart={e => { pillTouchX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - pillTouchX.current
            if (Math.abs(dx) < 40) return
            const idx = ALL_TAB_IDS.indexOf(activeTab)
            if (dx < 0 && idx < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[idx + 1])
            else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx - 1])
          }}
        >
          {PILL_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <motion.button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center gap-0.5 rounded-full transition-colors"
                style={{ padding:'8px 12px', color: active ? 'white' : '#9AA0A6', minWidth: 56 }}
                whileTap={{ scale: 0.9 }}>
                {active && (
                  <motion.div className="absolute inset-0 rounded-full" style={{ background:'#C8392B' }}
                    layoutId="pill-bg"
                    transition={{ type:'spring', stiffness:420, damping:32 }}/>
                )}
                <tab.Icon className="w-4 h-4 relative z-10 shrink-0"/>
                <span className="text-[8px] font-medium relative z-10 leading-none tracking-wide whitespace-nowrap">{tab.label}</span>
              </motion.button>
            )
          })}

          {/* Divider */}
          <div style={{ width:1, height:20, background:'rgba(61,81,102,0.5)', margin:'0 2px', flexShrink:0 }}/>

          {/* If on non-main tab: show it as active pill item */}
          {!isMainTab ? (
            <motion.button
              onClick={() => setShowGrid(v => !v)}
              className="relative flex flex-col items-center gap-0.5 rounded-full"
              style={{ padding:'8px 12px', color:'white', minWidth:56 }}
              whileTap={{ scale:0.9 }}>
              <motion.div className="absolute inset-0 rounded-full" style={{ background:'#C8392B' }}
                layoutId="pill-bg"
                transition={{ type:'spring', stiffness:420, damping:32 }}/>
              {activeTab_obj && <activeTab_obj.Icon className="w-4 h-4 relative z-10 shrink-0"/>}
              <span className="text-[8px] font-medium relative z-10 leading-none tracking-wide whitespace-nowrap">
                {activeTab_obj?.label ?? ''}
              </span>
            </motion.button>
          ) : (
            /* Grid button */
            <motion.button
              onClick={() => setShowGrid(v => !v)}
              className="flex flex-col items-center gap-0.5 rounded-full"
              style={{ padding:'8px 12px', color:'#9AA0A6', minWidth:40 }}
              whileTap={{ scale:0.9 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5"  cy="12" r="1.8"/>
                <circle cx="12" cy="12" r="1.8"/>
                <circle cx="19" cy="12" r="1.8"/>
              </svg>
              <span className="text-[8px] font-medium leading-none tracking-wide">Mehr</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  )
}

// Swipe on the screen content (optional extra)
export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const tx = useRef(0), ty = useRef(0)
  return (
    <div
      onTouchStart={e => { tx.current = e.touches[0].clientX; ty.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - tx.current
        const dy = e.changedTouches[0].clientY - ty.current
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
        const idx = ALL_TAB_IDS.indexOf(activeTab)
        if (dx < 0 && idx < ALL_TAB_IDS.length-1) setActiveTab(ALL_TAB_IDS[idx+1])
        else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx-1])
      }}>
      {children}
    </div>
  )
}
