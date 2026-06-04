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

export function Dock() {
  const { activeTab, setActiveTab } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll aktiven Tab ins Sichtfeld
  function scrollToTab(id: string) {
    const container = scrollRef.current
    if (!container) return
    const btn = container.querySelector(`[data-tab="${id}"]`) as HTMLElement
    if (!btn) return
    const containerCenter = container.offsetWidth / 2
    const btnCenter = btn.offsetLeft + btn.offsetWidth / 2
    container.scrollTo({ left: btnCenter - containerCenter, behavior: 'smooth' })
  }

  function handleTabClick(id: string) {
    setActiveTab(id)
    scrollToTab(id)
  }

  return (
    <motion.div
      className="fixed z-50"
      style={{
        bottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 32px), 380px)',
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.1 }}
    >
      <div style={{
        background: 'rgba(11,22,36,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: 999,
        padding: '5px 6px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Scrollable inner */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            gap: 2,
          }}
          className="scrollbar-hide"
        >
          {ALL_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="relative flex flex-col items-center rounded-full flex-shrink-0"
                style={{
                  padding: '8px 12px',
                  minWidth: 58,
                  color: active ? '#fff' : '#9AA0A6',
                  gap: 3,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'color 0.2s',
                }}
              >
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #C8392B, #a82e22)' }}
                    layoutId="pill-active"
                    transition={{ type: 'spring', stiffness: 460, damping: 30 }}
                  />
                )}
                <tab.Icon
                  className="relative z-10 shrink-0"
                  style={{ width: 17, height: 17 }}
                  strokeWidth={active ? 2 : 1.75}
                />
                <span className="relative z-10 whitespace-nowrap"
                  style={{ fontSize: 8, fontWeight: active ? 600 : 400, lineHeight: 1, letterSpacing: '0.02em' }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
