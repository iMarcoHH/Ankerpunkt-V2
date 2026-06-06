import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Trophy, Calculator, Newspaper, BookOpen,
  StickyNote, LogOut, X, Grid,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// v4 - rebuilt $(Date.now())
export const ALL_TABS = [
  { id: 'dashboard',      label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'buchungen',      label: 'Buchungen',   Icon: ListOrdered     },
  { id: 'analysen',       label: 'Analysen',    Icon: PieChart        },
  { id: 'ziele',          label: 'Ziele',       Icon: Target          },
  { id: 'versicherungen', label: 'Versicher.',  Icon: Shield          },
  { id: 'gamification',   label: 'Erfolge',     Icon: Trophy          },
  { id: 'rechner',        label: 'Rechner',     Icon: Calculator      },
  { id: 'news',           label: 'News',        Icon: Newspaper       },
  { id: 'notizen',        label: 'Notizen',     Icon: StickyNote      },
  { id: 'lexikon',        label: 'Lexikon',     Icon: BookOpen        },
]

export const ALL_TAB_IDS = ALL_TABS.map(t => t.id)
const PILL_TABS = [
  ALL_TABS.find(t => t.id === 'dashboard')!,
  ALL_TABS.find(t => t.id === 'buchungen')!,
  ALL_TABS.find(t => t.id === 'analysen')!,
  ALL_TABS.find(t => t.id === 'ziele')!,
]

export function PillNav() {
  const { activeTab, setActiveTab, setUserId, setTransactions, setInsurances,
          setGoals, setAchievements, setProfile } = useStore()
  const [gridOpen, setGridOpen] = useState(false)
  const swipeX = useRef(0)

  async function logout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null)
  }

  const currentTab = ALL_TABS.find(t => t.id === activeTab)
  const isSecondary = ALL_TAB_IDS.indexOf(activeTab) >= 4

  return (
    <>
      <AnimatePresence>
        {gridOpen && (
          <motion.div className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setGridOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gridOpen && (
          <motion.div className="fixed z-50"
            style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom,0px))', left: '50%', width: 'calc(100% - 2rem)', maxWidth: 320 }}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <div className="rounded-2xl overflow-hidden"
                 style={{ background: '#0D1B2A', border: '1px solid rgba(61,81,102,0.6)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
              <div className="flex items-center justify-between px-4 py-3"
                   style={{ borderBottom: '1px solid rgba(61,81,102,0.4)' }}>
                <span className="font-display tracking-widest text-white text-sm">ALLE SEITEN</span>
                <button onClick={() => setGridOpen(false)} className="text-cement"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4" style={{ gap: 1, background: 'rgba(61,81,102,0.3)' }}>
                {ALL_TABS.map(tab => {
                  const active = activeTab === tab.id
                  return (
                    <button key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setGridOpen(false) }}
                      className="flex flex-col items-center gap-1.5 py-4"
                      style={{ background: active ? 'rgba(200,57,43,0.2)' : '#0D1B2A', color: active ? '#C8392B' : '#9AA0A6' }}>
                      <tab.Icon className="w-5 h-5" />
                      <span className="text-[9px] font-medium text-center leading-tight px-1">{tab.label}</span>
                    </button>
                  )
                })}
                <button onClick={logout} className="flex flex-col items-center gap-1.5 py-4"
                  style={{ background: '#0D1B2A', color: '#9AA0A6' }}>
                  <LogOut className="w-5 h-5" />
                  <span className="text-[9px] font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PILL */}
      <div className="fixed z-50"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom,0.75rem))', left: '50%', transform: 'translateX(-50%)' }}>
        <motion.div
          className="flex items-center rounded-full"
          style={{
            background: 'rgba(13,27,42,0.97)',
            border: '1px solid rgba(61,81,102,0.5)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '8px 10px',
            gap: 8,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
          onTouchStart={e => { swipeX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - swipeX.current
            if (Math.abs(dx) < 40) return
            const idx = ALL_TAB_IDS.indexOf(activeTab)
            if (dx < 0 && idx < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[idx + 1])
            else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx - 1])
          }}>

          {PILL_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center rounded-full"
                style={{
                  padding: '8px 10px',
                  minWidth: 58,
                  color: active ? '#C8392B' : '#7F8796',
                  gap: 4,
                }}
                whileTap={{ scale: 0.88 }}>
                {active && (
                  <motion.div className="absolute inset-0 rounded-full" style={{ background: 'rgba(200,57,43,0.10)' }}
                    layoutId="dock-active"
                    transition={{ type: 'spring', stiffness: 440, damping: 30 }} />
                )}
                <tab.Icon className="w-5 h-5 relative z-10 shrink-0" />
                <span className="text-[11px] font-medium relative z-10 leading-none whitespace-nowrap">
                  {tab.label}
                </span>
              </motion.button>
            )
          })}

          {isSecondary && currentTab ? (
            <motion.button onClick={() => setGridOpen(v => !v)}
              className="relative flex flex-col items-center rounded-full"
              style={{ padding: '8px 10px', minWidth: 58, color: '#C8392B', gap: 4 }}
              whileTap={{ scale: 0.88 }}>
              <motion.div className="absolute inset-0 rounded-full" style={{ background: 'rgba(200,57,43,0.10)' }}
                layoutId="dock-active"
                transition={{ type: 'spring', stiffness: 440, damping: 30 }} />
              <currentTab.Icon className="w-5 h-5 relative z-10 shrink-0" />
              <span className="text-[11px] font-medium relative z-10 leading-none whitespace-nowrap">{currentTab.label}</span>
            </motion.button>
          ) : (
            <motion.button onClick={() => setGridOpen(v => !v)}
              className="flex flex-col items-center rounded-full"
              style={{ padding: '8px 10px', color: gridOpen ? '#C8392B' : '#7F8796', gap: 4, minWidth: 58 }}
              whileTap={{ scale: 0.88 }}>
              <Grid className="w-4 h-4 shrink-0" />
              <span className="text-[8px] font-medium leading-none whitespace-nowrap">Mehr</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const startX = useRef(0)
  const startY = useRef(0)
  return (
    <div
      onTouchStart={e => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - startX.current
        const dy = e.changedTouches[0].clientY - startY.current
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
        const idx = ALL_TAB_IDS.indexOf(activeTab)
        if (dx < 0 && idx < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[idx + 1])
        else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx - 1])
      }}>
      {children}
    </div>
  )
}
