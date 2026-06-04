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
const MAIN = ALL_TABS.slice(0, 4)

export function Dock() {
  const { activeTab, setActiveTab, setUserId, setTransactions,
          setInsurances, setGoals, setAchievements, setProfile } = useStore()
  const [open, setOpen] = useState(false)
  const x0 = useRef(0)

  async function logout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null)
  }

  const activeObj = ALL_TABS.find(t => t.id === activeTab)!
  const isExtra   = ALL_TAB_IDS.indexOf(activeTab) >= 4

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed z-50"
            style={{
              bottom: 'calc(4.8rem + env(safe-area-inset-bottom,0px))',
              left: '50%',
              width: 'min(calc(100vw - 32px), 340px)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 16, x: '-50%' }}
            animate={{ opacity: 1, scale: 1,   y: 0,  x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 16, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <div style={{
              background: '#111c2b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.7)',
            }}>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.15em', color: 'white' }}>
                  ALLE SEITEN
                </span>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#9AA0A6' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 p-3 gap-1">
                {ALL_TABS.map(tab => {
                  const active = activeTab === tab.id
                  return (
                    <button key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setOpen(false) }}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl transition-colors"
                      style={{
                        background: active ? 'rgba(200,57,43,0.2)' : 'transparent',
                        color: active ? '#C8392B' : '#9AA0A6',
                      }}>
                      <tab.Icon className="w-5 h-5" />
                      <span style={{ fontSize: 8, fontWeight: 500, lineHeight: 1.2, textAlign: 'center' }}>
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
                <button onClick={logout}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl"
                  style={{ color: '#9AA0A6' }}>
                  <LogOut className="w-5 h-5" />
                  <span style={{ fontSize: 8, fontWeight: 500 }}>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill */}
      <div
        className="fixed z-50"
        style={{
          bottom: 'max(14px, env(safe-area-inset-bottom,14px))',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <motion.div
          className="flex items-center rounded-full"
          style={{
            background: 'rgba(11,22,36,0.96)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            padding: '5px 6px',
            gap: 1,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04)',
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
          onTouchStart={e => { x0.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - x0.current
            if (Math.abs(dx) < 44) return
            const i = ALL_TAB_IDS.indexOf(activeTab)
            if (dx < 0 && i < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[i + 1])
            else if (dx > 0 && i > 0) setActiveTab(ALL_TAB_IDS[i - 1])
          }}
        >
          {/* 4 main tabs */}
          {MAIN.map(tab => {
            const active = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center rounded-full"
                style={{ padding: '8px 12px', color: active ? '#fff' : '#9AA0A6', gap: 3, minWidth: 56 }}
                whileTap={{ scale: 0.85 }}
              >
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #C8392B, #a82e22)' }}
                    layoutId="pill-highlight"
                    transition={{ type: 'spring', stiffness: 460, damping: 30 }}
                  />
                )}
                <tab.Icon className="w-[17px] h-[17px] relative z-10 shrink-0" strokeWidth={active ? 2 : 1.75} />
                <span className="relative z-10 whitespace-nowrap"
                  style={{ fontSize: 8, fontWeight: active ? 600 : 400, lineHeight: 1, letterSpacing: '0.02em' }}>
                  {tab.label}
                </span>
              </motion.button>
            )
          })}

          {/* Hairline divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px', flexShrink: 0 }} />

          {/* 5th slot: active extra tab OR dots button */}
          {isExtra ? (
            <motion.button
              onClick={() => setOpen(v => !v)}
              className="relative flex flex-col items-center rounded-full"
              style={{ padding: '8px 12px', color: '#fff', gap: 3, minWidth: 56 }}
              whileTap={{ scale: 0.85 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #C8392B, #a82e22)' }}
                layoutId="pill-highlight"
                transition={{ type: 'spring', stiffness: 460, damping: 30 }}
              />
              <activeObj.Icon className="w-[17px] h-[17px] relative z-10 shrink-0" strokeWidth={2} />
              <span className="relative z-10 whitespace-nowrap"
                style={{ fontSize: 8, fontWeight: 600, lineHeight: 1, letterSpacing: '0.02em' }}>
                {activeObj.label}
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setOpen(v => !v)}
              className="flex flex-col items-center rounded-full"
              style={{ padding: '8px 10px', gap: 3, color: open ? '#C8392B' : '#9AA0A6' }}
              whileTap={{ scale: 0.85 }}
            >
              <div className="flex gap-[3px] items-center" style={{ height: 17 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} className="rounded-full"
                    style={{ width: 4, height: 4, background: 'currentColor' }}
                    animate={{ scale: open && i === 1 ? 1.3 : 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 8, fontWeight: 400, lineHeight: 1, letterSpacing: '0.02em' }}>Mehr</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const x = useRef(0), y = useRef(0)
  return (
    <div
      onTouchStart={e => { x.current = e.touches[0].clientX; y.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - x.current
        const dy = e.changedTouches[0].clientY - y.current
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
        const i = ALL_TAB_IDS.indexOf(activeTab)
        if (dx < 0 && i < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[i + 1])
        else if (dx > 0 && i > 0) setActiveTab(ALL_TAB_IDS[i - 1])
      }}
    >
      {children}
    </div>
  )
}
