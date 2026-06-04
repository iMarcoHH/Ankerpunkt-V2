import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Trophy, Calculator, Newspaper, BookOpen, StickyNote,
} from 'lucide-react'

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
const PILL_TABS = ALL_TABS.slice(0, 4)

export function Dock() {
  const { activeTab, setActiveTab } = useStore()
  const swipeX = useRef(0)

  // Aktiver Tab außerhalb der ersten 4
  const extraIdx  = ALL_TAB_IDS.indexOf(activeTab)
  const isExtra   = extraIdx >= 4
  const activeObj = ALL_TABS[extraIdx]

  return (
    <div className="fixed z-50" style={{ bottom: 'max(14px, env(safe-area-inset-bottom, 14px))', left: '50%', transform: 'translateX(-50%)' }}>
      <motion.div
        className="flex items-center rounded-full"
        style={{
          background: 'rgba(11,22,36,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          padding: '5px 6px',
          gap: 2,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.1 }}
        onTouchStart={e => { swipeX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - swipeX.current
          if (Math.abs(dx) < 44) return
          const i = ALL_TAB_IDS.indexOf(activeTab)
          if (dx < 0 && i < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[i + 1])
          else if (dx > 0 && i > 0) setActiveTab(ALL_TAB_IDS[i - 1])
        }}
      >
        {PILL_TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center rounded-full"
              style={{ padding: '8px 12px', minWidth: 58, color: active ? '#fff' : '#9AA0A6', gap: 3 }}
              whileTap={{ scale: 0.85 }}>
              {active && (
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #C8392B, #a82e22)' }}
                  layoutId="pill-active"
                  transition={{ type: 'spring', stiffness: 460, damping: 30 }}/>
              )}
              <tab.Icon className="w-[17px] h-[17px] relative z-10 shrink-0" strokeWidth={active ? 2 : 1.75}/>
              <span className="relative z-10 whitespace-nowrap"
                style={{ fontSize: 8, fontWeight: active ? 600 : 400, lineHeight: 1, letterSpacing: '0.02em' }}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}

        {/* Wenn ein Tab außerhalb der ersten 4 aktiv ist — als 5. Element zeigen */}
        {isExtra && activeObj && (
          <>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px', flexShrink: 0 }}/>
            <motion.button onClick={() => setActiveTab(activeObj.id)}
              className="relative flex flex-col items-center rounded-full"
              style={{ padding: '8px 12px', minWidth: 58, color: '#fff', gap: 3 }}
              whileTap={{ scale: 0.85 }}>
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #C8392B, #a82e22)' }}
                layoutId="pill-active"
                transition={{ type: 'spring', stiffness: 460, damping: 30 }}/>
              <activeObj.Icon className="w-[17px] h-[17px] relative z-10 shrink-0" strokeWidth={2}/>
              <span className="relative z-10 whitespace-nowrap"
                style={{ fontSize: 8, fontWeight: 600, lineHeight: 1, letterSpacing: '0.02em' }}>
                {activeObj.label}
              </span>
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
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
      }}>
      {children}
    </div>
  )
}
