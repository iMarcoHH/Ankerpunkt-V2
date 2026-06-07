import { useStore } from '../store'
import { LayoutDashboard, ListOrdered, PieChart, TrendingDown, MoreHorizontal } from 'lucide-react'

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Übersicht',  Icon: LayoutDashboard },
  { id: 'buchungen', label: 'Buchungen',  Icon: ListOrdered     },
  { id: 'analysen',  label: 'Analysen',   Icon: PieChart        },
  { id: 'schulden',  label: 'Schulden',   Icon: TrendingDown    },
  { id: 'mehr',      label: 'Mehr',       Icon: MoreHorizontal  },
]

export function Dock() {
  const { activeTab, setActiveTab } = useStore()

  const isMore = !PRIMARY_TABS.slice(0, 4).some(t => t.id === activeTab)

  return (
    <>
      {/* Nav Bar */}
      <div style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 8,
        zIndex: 50,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(15,23,42,0.06)',
        borderRadius: 28,
        boxShadow: '0 12px 32px rgba(15,23,42,0.10)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          height: 56,
        }}>
          {PRIMARY_TABS.map(tab => {
            const active = tab.id === 'mehr'
              ? isMore
              : activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' })
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  padding: '2px 0 0',
                }}
              >
                {/* Icon Container */}
                <div style={{
                  width: 30,
                  height: 25,
                  borderRadius: 12,
                  background: active ? 'rgba(229,72,63,0.12)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <tab.Icon
                    width={22}
                    height={22}
                    strokeWidth={active ? 2.2 : 1.5}
                    style={{
                      color: active ? 'var(--accent)' : '#8A8A8E',
                      transition: 'color 0.2s',
                    }}
                  />
                </div>

                {/* Label */}
                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : '#8A8A8E',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                  transition: 'color 0.2s',
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dark mode: Nav auch dunkel */}
      <style>{`
        [data-theme="dark"] .dock-nav {
          background: rgba(15,23,42,0.95) !important;
          border-top-color: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </>
  )
}

export const ALL_TAB_IDS = PRIMARY_TABS.map(t => t.id)
