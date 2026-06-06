import { useStore } from '../store'
import { Target, Shield, Calculator, Newspaper, StickyNote, UserCircle, Receipt, Trophy, ChevronRight, BookOpen, Sparkles } from 'lucide-react'

const MEHR_ITEMS = [
  { section: 'Konto & Einstellungen', items: [
    { id: 'profil',         label: 'Profil & Einstellungen', Icon: UserCircle,  desc: 'Account, Dark Mode, Level' },
    { id: 'gamification',   label: 'Erfolge & XP',           Icon: Trophy,      desc: 'Achievements, Streak' },
  ]},
  { section: 'Finanzen', items: [
    { id: 'ziele',          label: 'Sparziele',               Icon: Target,      desc: 'Ziele verfolgen' },
    { id: 'versicherungen', label: 'Versicherungen',          Icon: Shield,      desc: 'Policen im Überblick' },
    { id: 'steuern',        label: 'Steuer-Tipps',            Icon: Receipt,     desc: 'Abzüge & Hinweise' },
  ]},
  { section: 'Tools', items: [
    { id: 'rechner',        label: 'Rechner',                 Icon: Calculator,  desc: 'Kredit, Zins, Währung' },
    { id: 'lexikon',        label: 'Finanz-Lexikon',          Icon: BookOpen,    desc: 'Finanzwissen einfach erklärt' },
    { id: 'news',           label: 'News',                    Icon: Newspaper,   desc: 'Wirtschaft & Finanzen' },
    { id: 'notizen',        label: 'Notizen',                 Icon: StickyNote,  desc: 'Persönliche Notizen' },
  ]},
]

export function MehrPage() {
  const { setActiveTab } = useStore()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div style={{ padding: '56px 20px 8px' }}>
        <p className="page-title">Mehr</p>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        <div className="app-card" style={{ padding: 18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <Sparkles width={18} height={18} style={{ color:'var(--accent)' }} />
            <p style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Finanzcockpit
            </p>
          </div>
          <p style={{ fontSize:18, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>
            Alle Funktionen an einem Ort
          </p>
          <p style={{ fontSize:13, color:'var(--secondary)' }}>
            Ziele, Versicherungen, Rechner, News, Lexikon und persönliche Einstellungen.
          </p>
        </div>
      </div>

      {MEHR_ITEMS.map(({ section, items }) => (
        <div key={section} style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            {section}
          </p>
          <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
            {items.map(({ id, label, Icon, desc }, i) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < items.length-1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 46, height: 46,
                  borderRadius: 14,
                  background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon width={18} height={18} style={{ color: 'var(--accent)' }} strokeWidth={1.75}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 1 }}>{label}</p>
                  <p style={{ fontSize: 13, color: 'var(--tertiary)' }}>{desc}</p>
                </div>
                <ChevronRight width={16} height={16} style={{ color: 'var(--tertiary)', flexShrink: 0 }}/>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
