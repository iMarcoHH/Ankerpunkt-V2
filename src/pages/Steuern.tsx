import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { Info, TrendingDown, Home, Car, Laptop, Heart, BookOpen, Briefcase, AlertCircle } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)

interface TaxTip {
  id:        string
  icon:      React.ReactNode
  title:     string
  desc:      string
  limit?:    string
  category:  string[]
  color:     string
}

const ALL_TIPS: TaxTip[] = [
  {
    id: 'homeoffice',
    icon: <Home className="w-5 h-5"/>,
    title: 'Homeoffice-Pauschale',
    desc: 'Arbeitest du von zuhause? Du kannst bis zu 210 Tage × 6€ = 1.260€ pro Jahr als Werbungskosten absetzen — ohne Einzelnachweis.',
    limit: 'Max. 1.260€/Jahr',
    category: ['Wohnen', 'Abos'],
    color: '#3B82F6',
  },
  {
    id: 'fahrtkosten',
    icon: <Car className="w-5 h-5"/>,
    title: 'Pendlerpauschale',
    desc: 'Für jeden Arbeitstag kannst du 0,30€ pro Entfernungskilometer (ab dem 21. km: 0,38€) zwischen Wohnung und Arbeit absetzen.',
    limit: '0,30€/km (ab 21km: 0,38€)',
    category: ['Transport'],
    color: '#10B981',
  },
  {
    id: 'arbeitsmittel',
    icon: <Laptop className="w-5 h-5"/>,
    title: 'Arbeitsmittel',
    desc: 'Computer, Schreibtisch, Bürostuhl, Telefon — wenn du sie beruflich nutzt, sind sie absetzbar. Geräte unter 952€ (netto) kannst du sofort abschreiben.',
    limit: 'Sofortabschreibung bis 952€',
    category: ['Bildung', 'Abos', 'Sonstiges'],
    color: '#8B5CF6',
  },
  {
    id: 'weiterbildung',
    icon: <BookOpen className="w-5 h-5"/>,
    title: 'Weiterbildung & Fortbildung',
    desc: 'Kurse, Bücher, Fachzeitschriften und Seminare die mit deinem Beruf zusammenhängen sind als Werbungskosten voll absetzbar.',
    limit: 'Unbegrenzt bei Berufsrelevanz',
    category: ['Bildung'],
    color: '#F59E0B',
  },
  {
    id: 'krankenversicherung',
    icon: <Heart className="w-5 h-5"/>,
    title: 'Kranken- & Pflegeversicherung',
    desc: 'Beiträge zur Kranken- und Pflegeversicherung zählen als Sonderausgaben und reduzieren dein zu versteuerndes Einkommen direkt.',
    limit: 'Bis 1.900€ (Arbeitnehmer)',
    category: ['Gesundheit', 'Versicherung'],
    color: '#EF4444',
  },
  {
    id: 'handwerker',
    icon: <Briefcase className="w-5 h-5"/>,
    title: 'Handwerkerleistungen',
    desc: 'Reparaturen, Renovierungen oder andere Handwerksleistungen in deiner Wohnung: 20% der Arbeitskosten (nicht Material) kannst du direkt von der Steuer abziehen.',
    limit: 'Max. 1.200€ Steuerersparnis/Jahr',
    category: ['Wohnen'],
    color: '#F97316',
  },
  {
    id: 'spenden',
    icon: <Heart className="w-5 h-5"/>,
    title: 'Spenden',
    desc: 'Spenden an gemeinnützige Organisationen sind als Sonderausgaben absetzbar. Bis 300€ reicht der Kontoauszug als Nachweis.',
    limit: 'Bis 20% des Gesamtbetrags',
    category: ['Sonstiges'],
    color: '#EC4899',
  },
  {
    id: 'riester',
    icon: <TrendingDown className="w-5 h-5"/>,
    title: 'Altersvorsorge (Riester/Rürup)',
    desc: 'Beiträge zur Riester- oder Rürup-Rente sind als Sonderausgaben absetzbar und bringen oft staatliche Zulagen oben drauf.',
    limit: 'Bis 2.100€/Jahr (Riester)',
    category: ['Sparen', 'Sonstiges'],
    color: '#14B8A6',
  },
]

export function SteuerPage() {
  const { transactions } = useStore()

  // Welche Kategorien hat der User genutzt?
  const usedCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category))
    return cats
  }, [transactions])

  // Jahresausgaben pro Kategorie
  const yearSpend = useMemo(() => {
    const now = new Date()
    const map: Record<string,number> = {}
    transactions
      .filter(t => { const d=new Date(t.date); return d.getFullYear()===now.getFullYear()&&t.type==='expense' })
      .forEach(t => { map[t.category]=(map[t.category]??0)+t.amount })
    return map
  }, [transactions])

  // Relevante Tipps — mit Userdaten anreichern
  const relevantTips = ALL_TIPS.filter(tip =>
    tip.category.some(c => usedCategories.has(c))
  )
  const otherTips = ALL_TIPS.filter(tip =>
    !tip.category.some(c => usedCategories.has(c))
  )

  const totalRelevant = relevantTips.length

  return (
    <div className="p-5 space-y-4 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Steuern</h1>
        <p className="text-cement text-sm mt-0.5">Tipps & Abzüge</p>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl p-4 flex gap-3" style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' }}>
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color:'#60A5FA' }}/>
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">Kein Steuerberater-Ersatz</p>
          <p className="text-xs text-cement leading-relaxed">Diese Tipps sind allgemeine Hinweise. Für deine individuelle Situation empfehlen wir einen Steuerberater oder ELSTER.</p>
        </div>
      </div>

      {/* Basierend auf deinen Daten */}
      {relevantTips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] text-cement tracking-widest uppercase">Für dich relevant</p>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-mono" style={{ background:'rgba(200,57,43,0.2)', color:'#C8392B' }}>
              {totalRelevant} Tipps
            </span>
          </div>
          {relevantTips.map((tip, i) => {
            const relCats = tip.category.filter(c => usedCategories.has(c))
            const relSpend = relCats.reduce((s,c) => s+(yearSpend[c]??0), 0)
            return (
              <motion.div key={tip.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                className="ak-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background:`${tip.color}22`, color:tip.color }}>
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-white">{tip.title}</p>
                      {tip.limit && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0"
                              style={{ background:`${tip.color}22`, color:tip.color }}>
                          {tip.limit}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cement leading-relaxed">{tip.desc}</p>
                    {relSpend > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 rounded-lg p-2"
                           style={{ background:'rgba(255,255,255,0.04)' }}>
                        <Info className="w-3 h-3 shrink-0" style={{ color:tip.color }}/>
                        <p className="text-[10px] text-cement">
                          Du hast dieses Jahr <span className="font-semibold" style={{ color:tip.color }}>{fmt(relSpend)}</span> in relevanten Kategorien ausgegeben.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Weitere Tipps */}
      {otherTips.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-cement tracking-widest uppercase">Weitere Tipps</p>
          {otherTips.map((tip, i) => (
            <motion.div key={tip.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
              className="ak-card p-4" style={{ opacity:0.6 }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background:`${tip.color}22`, color:tip.color }}>
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-white">{tip.title}</p>
                    {tip.limit && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0"
                            style={{ background:`${tip.color}22`, color:tip.color }}>
                        {tip.limit}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cement leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-4xl">📊</div>
          <p className="text-sm text-cement text-center">Trag erst ein paar Ausgaben ein —<br/>dann zeigen wir dir relevante Steuer-Tipps.</p>
        </div>
      )}
    </div>
  )
}
