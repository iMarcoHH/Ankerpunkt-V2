import { useState } from 'react'
import { BookOpen, Search, X } from 'lucide-react'

const ENTRIES = [
  { term:'Aktie',          category:'Investieren', def:'Wertpapier, das einen Anteil an einem Unternehmen repräsentiert. Aktionäre können von Dividenden und Kursgewinnen profitieren.', example:'Kaufst du eine Apple-Aktie, besitzt du einen kleinen Anteil am Unternehmen.', related:['ETF','Dividende','Depot'] },
  { term:'ALG I',          category:'Einkommen',   def:'Arbeitslosengeld I — staatliche Leistung bei Arbeitslosigkeit, berechnet aus dem letzten Nettogehalt (60% ohne Kind, 67% mit Kind).', example:'Nach dem Verlust deines Jobs erhältst du ALG I, das etwa 60% deines letzten Nettogehalts beträgt.', related:['Nettoeinkommen','Bruttoeinkommen','Sparquote'] },
  { term:'Anleihe',        category:'Investieren', def:'Schuldverschreibung eines Unternehmens oder Staates. Der Käufer verleiht Geld und erhält dafür Zinsen.', example:'Du kaufst eine Staatsanleihe und bekommst dafür jährlich feste Zinsen ausgezahlt.', related:['Zinseszins','Rendite','ETF'] },
  { term:'Bruttoeinkommen',category:'Einkommen',   def:'Gesamtverdienst vor Abzug von Steuern und Sozialabgaben.', example:'Auf deinem Arbeitsvertrag steht 3.000 € Bruttoeinkommen, davon gehen noch Steuern ab.', related:['Nettoeinkommen','ALG I','Sparquote'] },
  { term:'Cashflow',       category:'Finanzen',    def:'Zahlungsstrom: Differenz zwischen Einnahmen und Ausgaben in einem bestimmten Zeitraum.', example:'Wenn du monatlich 2.500 € einnimmst und 2.000 € ausgibst, beträgt dein Cashflow 500 €.', related:['Sparquote','Rendite','Tagesgeld'] },
  { term:'Depot',          category:'Investieren', def:'Konto zur Verwahrung von Wertpapieren wie Aktien, ETFs und Anleihen.', example:'Du eröffnest ein Depot bei einer Bank, um Aktien und ETFs zu kaufen.', related:['Aktie','ETF','Dividende'] },
  { term:'Dividende',      category:'Investieren', def:'Gewinnausschüttung eines Unternehmens an seine Aktionäre.', example:'Als Aktionär erhältst du jährlich eine Dividende von 2 € pro Aktie.', related:['Aktie','ETF','Rendite'] },
  { term:'ETF',            category:'Investieren', def:'Exchange Traded Fund — börsengehandelter Indexfonds, der einen Index (z.B. DAX, MSCI World) abbildet.', example:'Du investierst monatlich 100 € in einen MSCI World ETF und beteiligst dich damit an vielen Unternehmen gleichzeitig.', related:['Aktie','Depot','Rendite'] },
  { term:'Inflation',      category:'Finanzen',    def:'Allgemeiner Anstieg des Preisniveaus, der die Kaufkraft des Geldes verringert.', example:'Kostete ein Brot letztes Jahr 2 €, zahlst du dieses Jahr 2,20 € — das ist Inflation.', related:['Zinseszins','Tagesgeld','Sparquote'] },
  { term:'Kredit',         category:'Kredite',     def:'Darlehen einer Bank oder Institution. Die Rückzahlung erfolgt mit Zinsen über einen vereinbarten Zeitraum.', example:'Du nimmst einen Kredit über 10.000 € auf und zahlst ihn in 5 Jahren mit Zinsen zurück.', related:['Zinseszins','Cashflow','Tagesgeld'] },
  { term:'Nettoeinkommen', category:'Einkommen',   def:'Verdienst nach Abzug von Steuern und Sozialabgaben — das, was tatsächlich ausgezahlt wird.', example:'Von deinem Gehalt bleiben nach Abzügen 2.000 € Nettoeinkommen übrig.', related:['Bruttoeinkommen','ALG I','Sparquote'] },
  { term:'Rendite',        category:'Investieren', def:'Ertrag einer Geldanlage, ausgedrückt als Prozentsatz des eingesetzten Kapitals.', example:'Deine Investition von 1.000 € bringt dir nach einem Jahr 50 € Gewinn — das entspricht 5% Rendite.', related:['ETF','Aktie','Zinseszins'] },
  { term:'Sparquote',      category:'Finanzen',    def:'Anteil des Einkommens, der gespart wird. Berechnung: (Ersparnisse / Einkommen) × 100.', example:'Von 2.000 € Einkommen legst du 400 € zurück — deine Sparquote beträgt 20%.', related:['Cashflow','Nettoeinkommen','Tagesgeld'] },
  { term:'Tagesgeld',      category:'Finanzen',    def:'Kurzfristige Geldanlage mit täglich verfügbarem Kapital und variablem Zinssatz.', example:'Du parkst 5.000 € auf einem Tagesgeldkonto und kannst jederzeit darauf zugreifen.', related:['Sparquote','Cashflow','Kredit'] },
  { term:'Zinseszins',     category:'Investieren', def:'Zinsen, die auf bereits erhaltene Zinsen anfallen. Sorgt für exponentielles Wachstum über Zeit.', example:'Legst du 1.000 € zu 5% Zinsen an, wächst dein Geld dank Zinseszins jedes Jahr schneller.', related:['Rendite','Anleihe','Kredit'] },
]

const CATEGORIES = ['Alle','Investieren','Finanzen','Kredite','Einkommen']
const POPULAR    = ['ETF','Aktie','Inflation','Zinseszins']
const CAT_ICONS: Record<string,string> = { Investieren:'📈', Finanzen:'💰', Kredite:'🏦', Einkommen:'💼' }

export function LexikonPage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('Alle')
  const [open,     setOpen]     = useState<string|null>(null)

  const filtered = ENTRIES.filter(e => {
    const s = search.toLowerCase()
    return (!s || e.term.toLowerCase().includes(s) || e.def.toLowerCase().includes(s)) &&
           (category === 'Alle' || e.category === category)
  })

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Lexikon</h1>
        <p style={{ fontSize:15, color:'var(--secondary)', marginTop:4 }}>Finanzwissen verständlich erklärt</p>
      </div>

      {/* Search */}
      <div style={{ padding:'0 20px 16px', position:'relative' }}>
        <Search width={16} height={16} style={{ position:'absolute', left:34, top:'50%', transform:'translateY(-50%)', color:'var(--tertiary)' }}/>
        <input className="ak-input" style={{ paddingLeft:40 }}
          placeholder="Begriff suchen..." value={search}
          onChange={e => setSearch(e.target.value)}/>
        {search && (
          <button onClick={() => setSearch('')}
            style={{ position:'absolute', right:34, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
            <X width={14} height={14} style={{ color:'var(--tertiary)' }}/>
          </button>
        )}
      </div>

      {/* Kategorien */}
      <div style={{ padding:'0 20px 16px', display:'flex', gap:8, overflowX:'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{ padding:'7px 14px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', whiteSpace:'nowrap', flexShrink:0,
                     background: category===c ? 'var(--accent)' : 'var(--surface)',
                     color: category===c ? 'white' : 'var(--secondary)',
                     boxShadow: category===c ? '0 4px 12px rgba(229,72,63,.25)' : 'var(--shadow-sm)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Beliebte Begriffe */}
      {!search && (
        <div style={{ padding:'0 20px 16px' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Beliebte Begriffe</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {POPULAR.map(t => (
              <button key={t} onClick={() => setSearch(t)}
                style={{ padding:'7px 14px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)',
                         background:'var(--surface)', color:'var(--primary)', boxShadow:'var(--shadow-sm)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Einträge */}
      <div style={{ padding:'0 20px 20px', display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', gap:12 }}>
            <BookOpen width={48} height={48} style={{ color:'var(--tertiary)', opacity:0.3 }}/>
            <p style={{ fontSize:15, color:'var(--tertiary)' }}>Kein Begriff gefunden.</p>
          </div>
        ) : filtered.map(entry => (
          <div key={entry.term} className="app-card" style={{ padding:0, overflow:'hidden' }}>
            {/* Header */}
            <button
              onClick={() => setOpen(open === entry.term ? null : entry.term)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
                       background:'none', border:'none', cursor:'pointer', textAlign:'left',
                       WebkitTapHighlightColor:'transparent' }}>
              <div style={{ width:44, height:44, borderRadius:14,
                            background: `rgba(229,72,63,0.08)`,
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                {CAT_ICONS[entry.category] ?? '📖'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>{entry.term}</p>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>{entry.category}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tertiary)" strokeWidth="2" strokeLinecap="round"
                style={{ flexShrink:0, transition:'transform 0.2s', transform: open===entry.term ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Content */}
            {open === entry.term && (
              <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)' }}>
                <p style={{ fontSize:15, color:'var(--primary)', lineHeight:1.6, marginTop:14, marginBottom:14 }}>{entry.def}</p>

                {/* Beispiel */}
                <div style={{ background:'var(--bg)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Praxisbeispiel</p>
                  <p style={{ fontSize:14, color:'var(--secondary)', lineHeight:1.6 }}>{entry.example}</p>
                </div>

                {/* Verwandte Begriffe */}
                <p style={{ fontSize:11, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Verwandte Begriffe</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {entry.related.map(t => (
                    <button key={t} onClick={() => { setSearch(t); setOpen(null) }}
                      style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
                               border:'1px solid var(--border)', background:'var(--surface)', color:'var(--primary)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
