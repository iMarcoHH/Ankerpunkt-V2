import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Trophy, Calculator, Newspaper, BookOpen, StickyNote, UserCircle,
} from 'lucide-react'

export const ALL_TABS = [
  { id: 'dashboard',      label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'buchungen',      label: 'Buchungen',   Icon: ListOrdered     },
  { id: 'analysen',       label: 'Analysen',    Icon: PieChart        },
  { id: 'ziele',          label: 'Ziele',       Icon: Target          },
  { id: 'versicherungen', label: 'Versicher.',  Icon: Shield          },
  { id: 'rechner',        label: 'Rechner',     Icon: Calculator      },
  { id: 'news',           label: 'News',        Icon: Newspaper       },
  { id: 'notizen',        label: 'Notizen',     Icon: StickyNote      },
  { id: 'profil',         label: 'Profil',      Icon: UserCircle      },
]

export const ALL_TAB_IDS = ALL_TABS.map(t => t.id)

export function Dock() {
  const { activeTab, setActiveTab } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleTabClick(id: string) {
    setActiveTab(id)
    setTimeout(() => {
      const container = scrollRef.current
      if (!container) return
      const btn = container.querySelector(`[data-tab="${id}"]`) as HTMLElement
      if (!btn) return
      const center = btn.offsetLeft + btn.offsetWidth / 2 - container.offsetWidth / 2
      container.scrollTo({ left: center, behavior: 'smooth' })
    }, 50)
  }

  return (
    <div className="fixed z-50" style={{
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(11,22,36,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <motion.div
        style={{
          background: 'rgba(11,22,36,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 999,
          padding: '5px 8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.1 }}
      >
      <div ref={scrollRef} className="scrollbar-hide"
        style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', padding:'8px 8px 0' }}>
        {ALL_TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} data-tab={tab.id} onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center flex-shrink-0"
              style={{ padding:'6px 0 8px', flex:'0 0 calc(25% - 2px)', minWidth:64,
                       color:active?'#C8392B':'#9AA0A6', gap:4, border:'none',
                       background:'transparent', cursor:'pointer', WebkitTapHighlightColor:'transparent' }}>
              <tab.Icon className="shrink-0" style={{ width:22, height:22 }} strokeWidth={active?2:1.5}/>
              <span className="whitespace-nowrap"
                style={{ fontSize:10, fontWeight:active?600:400, lineHeight:1 }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
      </motion.div>
    </div>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
