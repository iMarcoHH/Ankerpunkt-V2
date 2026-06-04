import { useState } from 'react'

export function RechnerPage() {
  const [tab, setTab] = useState('kredit')
  const [kredit, setKredit] = useState({ betrag: '10000', zins: '5', laufzeit: '5' })
  const [waehrung, setWaehrung] = useState({ betrag: '100', kurs: '1.08', von: 'EUR', nach: 'USD' })
  const [zins, setZins] = useState({ kapital: '1000', zins: '5', jahre: '10' })
  const [alg, setAlg] = useState({ gehalt: '3000', kinder: 'nein' })

  const RATES: Record<string, number> = { EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.96, JPY: 163.5, DKK: 7.46, SEK: 11.2, NOK: 11.5 }

  const kreditRate = () => {
    const p = parseFloat(kredit.betrag), r = parseFloat(kredit.zins)/100/12, n = parseFloat(kredit.laufzeit)*12
    if (!p || !r || !n) return 0
    return (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1)
  }

  const zinsResult = () => {
    const k = parseFloat(zins.kapital), z = parseFloat(zins.zins)/100, j = parseFloat(zins.jahre)
    if (!k || !z || !j) return 0
    return k * Math.pow(1+z, j)
  }

  const algResult = () => {
    const n = parseFloat(alg.gehalt)
    if (!n) return 0
    return n * (alg.kinder === 'ja' ? 0.67 : 0.60)
  }

  const waehrungResult = () => {
    const b = parseFloat(waehrung.betrag)
    const from = RATES[waehrung.von] ?? 1
    const to   = RATES[waehrung.nach] ?? 1
    return (b / from) * to
  }

  const tabs = [
    { id: 'kredit',   label: 'Kredit'     },
    { id: 'zins',     label: 'Zinseszins' },
    { id: 'alg',      label: 'ALG I'      },
    { id: 'waehrung', label: 'Währung'    },
  ]

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// Werkzeug</div>
        <div className="font-display text-white text-4xl tracking-wide">RECHNER</div>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Tab switcher */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all"
              style={{
                background: tab === t.id ? '#0D1B2A' : 'white',
                color:      tab === t.id ? 'white'   : '#9AA0A6',
                border:     tab === t.id ? 'none'    : '1px solid rgba(0,0,0,0.08)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── KREDIT ── */}
        {tab === 'kredit' && (
          <div className="space-y-3">
            <Field label="Kreditbetrag (€)"  value={kredit.betrag}   onChange={v => setKredit({...kredit, betrag: v})}/>
            <Field label="Zinssatz (% p.a.)" value={kredit.zins}     onChange={v => setKredit({...kredit, zins: v})}/>
            <Field label="Laufzeit (Jahre)"  value={kredit.laufzeit} onChange={v => setKredit({...kredit, laufzeit: v})}/>
            <Result
              label="Monatliche Rate"
              value={`${kreditRate().toFixed(2).replace('.',',')} €`}
              sub={`Gesamtkosten: ${(kreditRate() * parseFloat(kredit.laufzeit) * 12).toLocaleString('de-DE', {maximumFractionDigits: 0})} €`}
            />
          </div>
        )}

        {/* ── ZINSESZINS ── */}
        {tab === 'zins' && (
          <div className="space-y-3">
            <Field label="Startkapital (€)" value={zins.kapital} onChange={v => setZins({...zins, kapital: v})}/>
            <Field label="Jahreszins (%)"   value={zins.zins}    onChange={v => setZins({...zins, zins: v})}/>
            <Field label="Laufzeit (Jahre)" value={zins.jahre}   onChange={v => setZins({...zins, jahre: v})}/>
            <Result
              label={`Endkapital nach ${zins.jahre} Jahren`}
              value={`${zinsResult().toLocaleString('de-DE', {maximumFractionDigits: 0})} €`}
              sub={`Gewinn: +${(zinsResult() - parseFloat(zins.kapital)).toLocaleString('de-DE', {maximumFractionDigits: 0})} €`}
              accent="#E8A832"
            />
          </div>
        )}

        {/* ── ALG I ── */}
        {tab === 'alg' && (
          <div className="space-y-3">
            <Field label="Letztes Nettoeinkommen (€)" value={alg.gehalt} onChange={v => setAlg({...alg, gehalt: v})}/>
            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-2">
                Kind mit Kindergeldanspruch?
              </label>
              <div className="flex gap-2">
                {(['nein', 'ja'] as const).map(v => (
                  <button key={v} onClick={() => setAlg({...alg, kinder: v})}
                    className="flex-1 py-2.5 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all"
                    style={{
                      background: alg.kinder === v ? '#0D1B2A' : 'white',
                      color:      alg.kinder === v ? 'white'   : '#9AA0A6',
                      border:     alg.kinder === v ? 'none'    : '1px solid rgba(0,0,0,0.08)',
                    }}>
                    {v === 'ja' ? 'Ja (67%)' : 'Nein (60%)'}
                  </button>
                ))}
              </div>
            </div>
            <div className="ak-card p-3" style={{ borderLeft: '3px solid #E8A832' }}>
              <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Hinweis</div>
              <div className="font-sans text-xs text-steel font-light leading-relaxed">
                ALG I beträgt 60% (ohne Kind) bzw. 67% (mit Kind) des letzten Nettolohns.
                Richtwert — genaue Berechnung via Bundesagentur für Arbeit.
              </div>
            </div>
            <Result
              label="Monatliches ALG I (ca.)"
              value={`${algResult().toLocaleString('de-DE', {maximumFractionDigits: 0})} €`}
              sub={`${alg.kinder === 'ja' ? '67%' : '60%'} des Nettoeinkommens`}
            />
          </div>
        )}

        {/* ── WÄHRUNG ── */}
        {tab === 'waehrung' && (
          <div className="space-y-3">
            <Field label="Betrag" value={waehrung.betrag} onChange={v => setWaehrung({...waehrung, betrag: v})}/>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Von</label>
                <select className="ak-input"
                  value={waehrung.von}
                  onChange={e => setWaehrung({...waehrung, von: e.target.value})}>
                  {Object.keys(RATES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <span className="font-display text-navy text-2xl">→</span>
              </div>
              <div className="flex-1">
                <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Nach</label>
                <select className="ak-input"
                  value={waehrung.nach}
                  onChange={e => setWaehrung({...waehrung, nach: e.target.value})}>
                  {Object.keys(RATES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Result
              label={`${waehrung.betrag} ${waehrung.von} =`}
              value={`${waehrungResult().toFixed(2).replace('.',',')} ${waehrung.nach}`}
              sub="Richtwert · Kurs kann abweichen"
            />
          </div>
        )}

      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">{label}</label>
      <input
        className="ak-input"
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function Result({ label, value, sub, accent = '#C8392B' }: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: '#0D1B2A' }}>
      <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mb-2">{label}</div>
      <div className="font-display text-white tracking-wide" style={{ fontSize: 42, lineHeight: 1 }}>{value}</div>
      {sub && <div className="font-mono text-[10px] mt-2" style={{ color: accent }}>{sub}</div>}
    </div>
  )
}
