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
    id: 'add',
    label: '',
    icon: (_active: boolean) => (
      <div className="w-12 h-12 rounded-full bg-red flex items-center justify-center"
           style={{ boxShadow: '0 4px 20px rgba(200,57,43,0.4)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    ),
  },
  {
    id: 'versicherungen',
    label: 'Versicherung',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#C8392B' : '#9AA0A6'} strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

interface BottomNavProps {
  onAddClick: () => void
}

export function BottomNav({ onAddClick }: BottomNavProps) {
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
          const isActive = activeTab === tab.id && tab.id !== 'add'
          const isAdd    = tab.id === 'add'
          return (
            <button
              key={tab.id}
              onClick={() => isAdd ? onAddClick() : setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {tab.icon(isActive)}
              {!isAdd && (
                <span
                  className="font-mono uppercase transition-colors"
                  style={{ fontSize: 8, letterSpacing: '0.08em', color: isActive ? '#C8392B' : '#9AA0A6' }}
                >
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
