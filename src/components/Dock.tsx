import { useRef } from 'react'
import { useStore } from '../store'
import {
  LayoutDashboard, ListOrdered, PieChart, Target,
  Shield, Calculator, Newspaper, StickyNote, UserCircle,
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
    <div style={{
      position: 'fixed',
      bottom: 8,
      left: 16,
      right: 16,
      zIndex: 50,
    }}>
      <div style={{
        background: 'rgba(11,22,36,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {ALL_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '10px 0',
                  flex: '0 0 25%',
                  minWidth: 64,
                  border: 'none',
                  background: active ? 'rgba(200,57,43,0.15)' : 'transparent',
                  color: active ? '#C8392B' : '#9AA0A6',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <tab.Icon width={20} height={20} strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
