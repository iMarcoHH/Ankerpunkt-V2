import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'

const ENTRIES = [
  { term: 'Aktie',          category: 'Investieren', def: 'Wertpapier, das einen Anteil an einem Unternehmen repräsentiert. Aktionäre können von Dividenden und Kursgewinnen profitieren.' },
  { term: 'ALG I',          category: 'Einkommen', def: 'Arbeitslosengeld I — staatliche Leistung bei Arbeitslosigkeit, berechnet aus dem letzten Nettogehalt (60% ohne Kind, 67% mit Kind).' },
  { term: 'Anleihe',        category: 'Investieren', def: 'Schuldverschreibung eines Unternehmens oder Staates. Der Käufer verleiht Geld und erhält dafür Zinsen.' },
  { term: 'Bruttoeinkommen',category: 'Einkommen', def: 'Gesamtverdienst vor Abzug von Steuern und Sozialabgaben.' },
  { term: 'Cashflow',       category: 'Finanzen', def: 'Zahlungsstrom: Differenz zwischen Einnahmen und Ausgaben in einem bestimmten Zeitraum.' },
  { term: 'Depot',          category: 'Investieren', def: 'Konto zur Verwahrung von Wertpapieren wie Aktien, ETFs und Anleihen.' },
  { term: 'Dividende',      category: 'Investieren', def: 'Gewinnausschüttung eines Unternehmens an seine Aktionäre.' },
  { term: 'ETF',            category: 'Investieren', def: 'Exchange Traded Fund — börsengehandelter Indexfonds, der einen Index (z.B. DAX, MSCI World) abbildet.' },
  { term: 'Inflation',      category: 'Finanzen', def: 'Allgemeiner Anstieg des Preisniveaus, der die Kaufkraft des Geldes verringert.' },
  { term: 'Kredit',         category: 'Kredite', def: 'Darlehen einer Bank oder Institution. Die Rückzahlung erfolgt mit Zinsen über einen vereinbarten Zeitraum.' },
  { term: 'Nettoeinkommen', category: 'Einkommen', def: 'Verdienst nach Abzug von Steuern und Sozialabgaben — das, was tatsächlich ausgezahlt wird.' },
  { term: 'Rendite',        category: 'Investieren', def: 'Ertrag einer Geldanlage, ausgedrückt als Prozentsatz des eingesetzten Kapitals.' },
  { term: 'Sparquote',      category: 'Finanzen', def: 'Anteil des Einkommens, der gespart wird. Berechnung: (Ersparnisse / Einkommen) × 100.' },
  { term: 'Tagesgeld',      category: 'Finanzen', def: 'Kurzfristige Geldanlage mit täglich verfügbarem Kapital und variablem Zinssatz.' },
  { term: 'Zinseszins',     category: 'Investieren', def: 'Zinsen, die auf bereits erhaltene Zinsen anfallen. Sorgt für exponentielles Wachstum über Zeit.' },
]

export function LexikonPage() {
  const [search, setSearch] = useState('')
  const popularTerms = ['ETF', 'Aktie', 'Inflation', 'Zinseszins']

  const categories = ['Alle','Investieren','Finanzen','Kredite','Einkommen']
  const [activeCategory, setActiveCategory] = useState('Alle')

  const todaysTerm = ENTRIES.find(e => e.term === 'ETF') || ENTRIES[0]

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
        <p className="text-cement text-sm mt-1">Finanzwissen verständlich erklärt</p>
      </div>

      <div className="ak-card p-5">
        <p className="text-cement text-xs uppercase tracking-wide mb-2">Finanzwissen</p>
        <h2 className="text-white font-semibold text-lg mb-2">Begriffe schnell verstehen</h2>
        <p className="text-cement text-sm leading-relaxed">
          Von ETF bis Inflation – die wichtigsten Finanzbegriffe einfach und verständlich erklärt.
        </p>
      </div>

      <div className="ak-card p-5">
        <p className="text-cement text-xs uppercase tracking-wide mb-2">Begriff des Tages</p>
        <h2 className="text-white font-semibold text-xl mb-2">📖 {todaysTerm.term}</h2>
        <p className="text-cement text-sm leading-relaxed">
          {todaysTerm.def}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cement"/>
        <input className="ak-input pl-10" placeholder="Begriff suchen..."
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div>
        <p className="text-cement text-xs uppercase tracking-wide mb-2">Kategorien</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="ak-card px-3 py-2 text-sm"
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
        <p className="text-cement text-xs uppercase tracking-wide mb-2">Beliebte Begriffe</p>
        <div className="flex flex-wrap gap-2">
          {popularTerms.map(term => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className="ak-card px-3 py-2 text-sm text-white"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="ak-card p-4 flex items-center justify-between">
        <div>
          <p className="text-cement text-xs">Gefundene Begriffe</p>
          <p className="text-white text-2xl font-bold">{filtered.length}</p>
        </div>
        <BookOpen className="w-8 h-8 text-red" />
      </div>

      <div className="ak-card p-5">
        <p className="text-cement text-xs uppercase tracking-wide mb-3">⭐ Wichtigste Begriffe</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-white">ETF</div>
          <div className="text-white">Inflation</div>
          <div className="text-white">Rendite</div>
          <div className="text-white">Zinseszins</div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <details key={entry.term}
            className="ak-card overflow-hidden group"
            style={{ animationDelay: `${i*0.03}s` }}>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(200,57,43,0.15)' }}>
                  <BookOpen className="w-4 h-4 text-red"/>
                </div>
                <span className="font-semibold text-white">{entry.term}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round"
                className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-0">
              <div className="h-px mb-3" style={{ background:'rgba(61,81,102,0.4)' }}/>
              <p className="text-sm text-cement leading-relaxed">{entry.def}</p>
              <div className="mt-3 p-3 rounded-xl" style={{ background:'rgba(200,57,43,0.08)' }}>
                <p className="text-xs text-red font-medium">
                  💡 Warum wichtig?
                </p>
                <p className="text-xs text-cement mt-1">
                  Dieser Begriff gehört zu den Grundlagen für bessere Finanzentscheidungen.
                </p>
              </div>
              <div className="mt-3 text-xs text-red font-medium">
                Finanzbegriff
              </div>
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-cement">
            <BookOpen className="w-14 h-14 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Kein Begriff gefunden.</p>
          </div>
        )}
      </div>
    </div>
  )
}
