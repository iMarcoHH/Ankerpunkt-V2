import { useRef } from 'react'
import { useStore } from '../store'
import { LayoutDashboard, ListOrdered, PieChart, TrendingDown, MoreHorizontal } from 'lucide-react'

const PRIMARY_TABS = [
  { id: 'dashboard',  label: 'Übersicht',  Icon: LayoutDashboard },
  { id: 'buchungen',  label: 'Buchungen',  Icon: ListOrdered     },
  { id: 'schulden',   label: 'Schulden',   Icon: TrendingDown    },
  { id: 'analysen',   label: 'Analysen',   Icon: PieChart        },
  { id: 'mehr',       label: 'Mehr',       Icon: MoreHorizontal  },
]

export const ALL_TABS = [
  { id: 'dashboard',      label: 'Übersicht',   Icon: LayoutDashboard },
  { id: 'analysen',       label: 'Analysen',    Icon: PieChart        },
  { id: 'schulden',       label: 'Schulden',    Icon: TrendingDown    },
  { id: 'buchungen',      label: 'Buchungen',   Icon: ListOrdered     },
  { id: 'ziele',          label: 'Ziele',       Icon: LayoutDashboard },
  { id: 'versicherungen', label: 'Versicher.',  Icon: LayoutDashboard },
  { id: 'rechner',        label: 'Rechner',     Icon: LayoutDashboard },
  { id: 'news',           label: 'News',        Icon: LayoutDashboard },
  { id: 'steuern',        label: 'Steuern',     Icon: LayoutDashboard },
  { id: 'notizen',        label: 'Notizen',     Icon: LayoutDashboard },
  { id: 'profil',         label: 'Profil',      Icon: LayoutDashboard },
  { id: 'gamification',   label: 'Erfolge',     Icon: LayoutDashboard },
]

export const ALL_TAB_IDS = ALL_TABS.map(t => t.id)

export function Dock() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <div
      className="bottom-nav"
      style={{
        padding: '0 6px',
        width: 'fit-content',
        margin: '0 auto 12px auto',
        background: '#FFFFFF',
        border: '1px solid rgba(15,23,42,0.06)',
        borderRadius: 999,
        boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {PRIMARY_TABS.map(tab => {
        const active = activeTab === tab.id ||
          (tab.id === 'mehr' && !PRIMARY_TABS.slice(0,4).some(t => t.id === activeTab))
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              // Scroll to top on tab change
              document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' })
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              padding: '6px 0',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(229,72,63,0.08)',
              }}/>
            )}
            <tab.Icon
              width={20} height={20}
              strokeWidth={active ? 2 : 1.5}
              style={{ color: active ? 'var(--accent)' : 'var(--tertiary)', position: 'relative' }}
            />
            <span style={{
              fontSize: 9,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--accent)' : 'var(--tertiary)',
              lineHeight: 1,
              position: 'relative',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
