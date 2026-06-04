import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'

const ENTRIES = [
  { term: 'Aktie',          def: 'Wertpapier, das einen Anteil an einem Unternehmen repräsentiert. Aktionäre können von Dividenden und Kursgewinnen profitieren.' },
  { term: 'ALG I',          def: 'Arbeitslosengeld I — staatliche Leistung bei Arbeitslosigkeit, berechnet aus dem letzten Nettogehalt (60% ohne Kind, 67% mit Kind).' },
  { term: 'Anleihe',        def: 'Schuldverschreibung eines Unternehmens oder Staates. Der Käufer verleiht Geld und erhält dafür Zinsen.' },
  { term: 'Bruttoeinkommen',def: 'Gesamtverdienst vor Abzug von Steuern und Sozialabgaben.' },
  { term: 'Cashflow',       def: 'Zahlungsstrom: Differenz zwischen Einnahmen und Ausgaben in einem bestimmten Zeitraum.' },
  { term: 'Depot',          def: 'Konto zur Verwahrung von Wertpapieren wie Aktien, ETFs und Anleihen.' },
  { term: 'Dividende',      def: 'Gewinnausschüttung eines Unternehmens an seine Aktionäre.' },
  { term: 'ETF',            def: 'Exchange Traded Fund — börsengehandelter Indexfonds, der einen Index (z.B. DAX, MSCI World) abbildet.' },
  { term: 'Inflation',      def: 'Allgemeiner Anstieg des Preisniveaus, der die Kaufkraft des Geldes verringert.' },
  { term: 'Kredit',         def: 'Darlehen einer Bank oder Institution. Die Rückzahlung erfolgt mit Zinsen über einen vereinbarten Zeitraum.' },
  { term: 'Nettoeinkommen', def: 'Verdienst nach Abzug von Steuern und Sozialabgaben — das, was tatsächlich ausgezahlt wird.' },
  { term: 'Rendite',        def: 'Ertrag einer Geldanlage, ausgedrückt als Prozentsatz des eingesetzten Kapitals.' },
  { term: 'Sparquote',      def: 'Anteil des Einkommens, der gespart wird. Berechnung: (Ersparnisse / Einkommen) × 100.' },
  { term: 'Tagesgeld',      def: 'Kurzfristige Geldanlage mit täglich verfügbarem Kapital und variablem Zinssatz.' },
  { term: 'Zinseszins',     def: 'Zinsen, die auf bereits erhaltene Zinsen anfallen. Sorgt für exponentielles Wachstum über Zeit.' },
]

export function LexikonPage() {
  const [search, setSearch] = useState('')
  const filtered = ENTRIES.filter(e =>
    e.term.toLowerCase().includes(search.toLowerCase()) ||
    e.def.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Lexikon</h1>
        <p className="text-cement text-sm mt-1">Finanzbegriffe einfach erklärt</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cement"/>
        <input className="ak-input pl-10" placeholder="Begriff suchen..."
          value={search} onChange={e => setSearch(e.target.value)}/>
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'rgba(200,57,43,0.15)' }}>
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
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-cement">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30"/>
            <p className="text-sm">Kein Begriff gefunden.</p>
          </div>
        )}
      </div>
    </div>
  )
}
