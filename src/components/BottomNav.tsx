import { useStore } from '../store'

const TABS = [
  {
    id: 'lagebericht',
    label: 'Lage',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#C8392B' : '#9AA0A6'} strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'analysen',
    label: 'Analysen',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#C8392B' : '#9AA0A6'} strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    id: 'buchungen',
    label: 'Buchungen',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#C8392B' : '#9AA0A6'} strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'mehr',
    label: 'Mehr',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#C8392B' : '#9AA0A6'} strokeWidth="2" strokeLinecap="round">
        <circle cx="5"  cy="12" r="1" fill={active ? '#C8392B' : '#9AA0A6'}/>
        <circle cx="12" cy="12" r="1" fill={active ? '#C8392B' : '#9AA0A6'}/>
        <circle cx="19" cy="12" r="1" fill={active ? '#C8392B' : '#9AA0A6'}/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2" style={{ height: '64px' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {tab.icon(isActive)}
              <span
                className="font-mono uppercase transition-colors"
                style={{ fontSize: 8, letterSpacing: '0.08em', color: isActive ? '#C8392B' : '#9AA0A6' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
