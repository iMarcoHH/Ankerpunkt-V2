import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'

const ENTRIES = [
  {
    term: 'Aktie',
    category: 'Investieren',
    def: 'Wertpapier, das einen Anteil an einem Unternehmen repräsentiert. Aktionäre können von Dividenden und Kursgewinnen profitieren.',
    example: 'Kaufst du eine Apple-Aktie, besitzt du einen kleinen Anteil am Unternehmen.',
    related: ['ETF','Dividende','Depot']
  },
  {
    term: 'ALG I',
    category: 'Einkommen',
    def: 'Arbeitslosengeld I — staatliche Leistung bei Arbeitslosigkeit, berechnet aus dem letzten Nettogehalt (60% ohne Kind, 67% mit Kind).',
    example: 'Nach dem Verlust deines Jobs erhältst du ALG I, das etwa 60% deines letzten Nettogehalts beträgt.',
    related: ['Nettoeinkommen','Bruttoeinkommen','Sparquote']
  },
  {
    term: 'Anleihe',
    category: 'Investieren',
    def: 'Schuldverschreibung eines Unternehmens oder Staates. Der Käufer verleiht Geld und erhält dafür Zinsen.',
    example: 'Du kaufst eine Staatsanleihe und bekommst dafür jährlich feste Zinsen ausgezahlt.',
    related: ['Zinseszins','Rendite','ETF']
  },
  {
    term: 'Bruttoeinkommen',
    category: 'Einkommen',
    def: 'Gesamtverdienst vor Abzug von Steuern und Sozialabgaben.',
    example: 'Auf deinem Arbeitsvertrag steht 3.000 € Bruttoeinkommen, davon gehen noch Steuern ab.',
    related: ['Nettoeinkommen','ALG I','Sparquote']
  },
  {
    term: 'Cashflow',
    category: 'Finanzen',
    def: 'Zahlungsstrom: Differenz zwischen Einnahmen und Ausgaben in einem bestimmten Zeitraum.',
    example: 'Wenn du monatlich 2.500 € einnimmst und 2.000 € ausgibst, beträgt dein Cashflow 500 €.',
    related: ['Sparquote','Rendite','Tagesgeld']
  },
  {
    term: 'Depot',
    category: 'Investieren',
    def: 'Konto zur Verwahrung von Wertpapieren wie Aktien, ETFs und Anleihen.',
    example: 'Du eröffnest ein Depot bei einer Bank, um Aktien und ETFs zu kaufen.',
    related: ['Aktie','ETF','Dividende']
  },
  {
    term: 'Dividende',
    category: 'Investieren',
    def: 'Gewinnausschüttung eines Unternehmens an seine Aktionäre.',
    example: 'Als Aktionär erhältst du jährlich eine Dividende von 2 € pro Aktie.',
    related: ['Aktie','ETF','Rendite']
  },
  {
    term: 'ETF',
    category: 'Investieren',
    def: 'Exchange Traded Fund — börsengehandelter Indexfonds, der einen Index (z.B. DAX, MSCI World) abbildet.',
    example: 'Du investierst monatlich 100 € in einen MSCI World ETF und beteiligst dich damit an vielen Unternehmen gleichzeitig.',
    related: ['Aktie','Depot','Rendite']
  },
  {
    term: 'Inflation',
    category: 'Finanzen',
    def: 'Allgemeiner Anstieg des Preisniveaus, der die Kaufkraft des Geldes verringert.',
    example: 'Kostete ein Brot letztes Jahr 2 €, zahlst du dieses Jahr 2,20 € — das ist Inflation.',
    related: ['Zinseszins','Tagesgeld','Sparquote']
  },
  {
    term: 'Kredit',
    category: 'Kredite',
    def: 'Darlehen einer Bank oder Institution. Die Rückzahlung erfolgt mit Zinsen über einen vereinbarten Zeitraum.',
    example: 'Du nimmst einen Kredit über 10.000 € auf und zahlst ihn in 5 Jahren mit Zinsen zurück.',
    related: ['Zinseszins','Cashflow','Tagesgeld']
  },
  {
    term: 'Nettoeinkommen',
    category: 'Einkommen',
    def: 'Verdienst nach Abzug von Steuern und Sozialabgaben — das, was tatsächlich ausgezahlt wird.',
    example: 'Von deinem Gehalt bleiben nach Abzügen 2.000 € Nettoeinkommen übrig.',
    related: ['Bruttoeinkommen','ALG I','Sparquote']
  },
  {
    term: 'Rendite',
    category: 'Investieren',
    def: 'Ertrag einer Geldanlage, ausgedrückt als Prozentsatz des eingesetzten Kapitals.',
    example: 'Deine Investition von 1.000 € bringt dir nach einem Jahr 50 € Gewinn — das entspricht 5% Rendite.',
    related: ['ETF','Aktie','Zinseszins']
  },
  {
    term: 'Sparquote',
    category: 'Finanzen',
    def: 'Anteil des Einkommens, der gespart wird. Berechnung: (Ersparnisse / Einkommen) × 100.',
    example: 'Von 2.000 € Einkommen legst du 400 € zurück — deine Sparquote beträgt 20%.',
    related: ['Cashflow','Nettoeinkommen','Tagesgeld']
  },
  {
    term: 'Tagesgeld',
    category: 'Finanzen',
    def: 'Kurzfristige Geldanlage mit täglich verfügbarem Kapital und variablem Zinssatz.',
    example: 'Du parkst 5.000 € auf einem Tagesgeldkonto und kannst jederzeit darauf zugreifen.',
    related: ['Sparquote','Cashflow','Kredit']
  },
  {
    term: 'Zinseszins',
    category: 'Investieren',
    def: 'Zinsen, die auf bereits erhaltene Zinsen anfallen. Sorgt für exponentielles Wachstum über Zeit.',
    example: 'Legst du 1.000 € zu 5% Zinsen an, wächst dein Geld dank Zinseszins jedes Jahr schneller.',
    related: ['Rendite','Anleihe','Kredit']
  },
]

export function LexikonPage() {
  const [search, setSearch] = useState('')
  const popularTerms = ['ETF', 'Aktie', 'Inflation', 'Zinseszins']

  const categories = ['Alle','Investieren','Finanzen','Kredite','Einkommen']
  const [activeCategory, setActiveCategory] = useState('Alle')

  const filtered = ENTRIES.filter(e => {
    const searchMatch =
      e.term.toLowerCase().includes(search.toLowerCase()) ||
      e.def.toLowerCase().includes(search.toLowerCase())

    const categoryMatch = activeCategory === 'Alle' || e.category === activeCategory

    return searchMatch && categoryMatch
  })

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Lexikon</h1>
        <p style={{ color:'#D7DCE2' }} className="text-sm mt-1">Finanzwissen verständlich erklärt</p>
      </div>

      <div className="ak-card p-6 text-white">
        <p style={{ color:'#AEB8C4' }} className="text-xs uppercase tracking-wide mb-2">Finanzwissen</p>
        <h2 className="text-white font-semibold text-xl mb-2">Finanzbegriffe einfach erklärt</h2>
        <p style={{ color:'#D7DCE2' }} className="text-sm leading-relaxed">
          Schnell verstehen statt googeln. Die wichtigsten Begriffe rund um Geld, ETFs, Versicherungen und Einkommen.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white"/>
        <input className="ak-input pl-10 text-white" placeholder="Begriff suchen..."
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div>
        <p className="text-white text-xs uppercase tracking-wide mb-2">Kategorien</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="ak-card text-white px-3 py-2 text-sm"
              style={{
                border: activeCategory === cat ? '1px solid rgba(200,57,43,0.6)' : undefined,
                color: activeCategory === cat ? '#fff' : undefined
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white text-xs uppercase tracking-wide mb-2">Beliebte Begriffe</p>
        <div className="flex flex-wrap gap-2">
          {popularTerms.map(term => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className="ak-card text-white px-3 py-2 text-sm"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white text-xs uppercase tracking-wide mb-2">⭐ Wichtigste Begriffe</p>
        <div className="grid grid-cols-2 gap-2">
          {['ETF','Inflation','Rendite','Zinseszins'].map(term => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className="ak-card text-white p-3 text-left text-sm font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <details key={entry.term}
            className="ak-card text-white overflow-hidden group"
            style={{ animationDelay: `${i*0.03}s` }}>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(200,57,43,0.15)' }}>
                  <BookOpen className="w-5 h-5 text-red"/>
                </div>
                <div>
                  <p className="font-semibold text-white">{entry.term}</p>
                  <p style={{ color:'#AEB8C4' }} className="text-xs mt-0.5">{entry.category}</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round"
                className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-0">
              <div className="h-px mb-3" style={{ background:'rgba(61,81,102,0.4)' }}/>
              <p style={{ color:'#FFFFFF' }} className="text-sm leading-relaxed">{entry.def}</p>
              <div className="mt-4 ak-card text-white p-4" style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-wide text-white mb-2">Praxisbeispiel</p>
                <p style={{ color:'#D7DCE2' }} className="text-sm leading-relaxed">
                  {entry.example}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-white mb-2">Verwandte Begriffe</p>
                <div className="flex flex-wrap gap-2">
                  {entry.related.map(term => (
                    <button
                      key={term}
                      onClick={() => setSearch(term)}
                      className="ak-card text-white px-3 py-1.5 text-xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white">
            <BookOpen className="w-14 h-14 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Kein Begriff gefunden.</p>
          </div>
        )}
      </div>
    </div>
  )
}
