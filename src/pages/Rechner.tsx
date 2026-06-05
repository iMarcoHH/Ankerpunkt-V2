import { useState } from 'react'

const fmt = (v: number) => v.toLocaleString('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
const fmtCur = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)

const TABS = [
  { id: 'kredit',   label: 'Kredit'      },
  { id: 'zins',     label: 'Zinseszins'  },
  { id: 'alg',      label: 'ALG I'       },
  { id: 'waehrung', label: 'Währung'     },
]

const RATES: Record<string, number> = {
  EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.96,
  JPY: 163.5, DKK: 7.46, SEK: 11.2, NOK: 11.5,
}

export function RechnerPage() {
  const [tab, setTab] = useState('kredit')

  // Kredit
  const [kBetrag, setKBetrag]   = useState('10000')
  const [kZins,   setKZins]     = useState('5')
  const [kLauf,   setKLauf]     = useState('5')

  // Zins
  const [zKap,    setZKap]      = useState('1000')
  const [zZins,   setZZins]     = useState('5')
  const [zJahre,  setZJahre]    = useState('10')

  // ALG
  const [aGehalt, setAGehalt]   = useState('3000')
  const [aKinder, setAKinder]   = useState<'nein'|'ja'>('nein')

  // Währung
  const [wBetrag, setWBetrag]   = useState('100')
  const [wVon,    setWVon]      = useState('EUR')
  const [wNach,   setWNach]     = useState('USD')

  const kreditRate = () => {
    const p = parseFloat(kBetrag), r = parseFloat(kZins)/100/12, n = parseFloat(kLauf)*12
    if (!p||!r||!n) return 0
    return (p*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)
  }
  const zinsResult  = () => { const k=parseFloat(zKap),z=parseFloat(zZins)/100,j=parseFloat(zJahre); if(!k||!z||!j) return 0; return k*Math.pow(1+z,j) }
  const algResult   = () => { const n=parseFloat(aGehalt); if(!n) return 0; return n*(aKinder==='ja'?0.67:0.60) }
  const waehrResult = () => (parseFloat(wBetrag)/(RATES[wVon]??1))*(RATES[wNach]??1)

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <p className="text-xs text-red font-mono tracking-widest uppercase mb-1">// Werkzeug</p>
        <h1 className="font-display text-4xl tracking-widest text-white">Rechner</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab===t.id ? '#0D1B2A' : 'rgba(255,255,255,0.06)',
                     color: tab===t.id ? 'white' : '#9AA0A6',
                     border: tab===t.id ? '1px solid rgba(61,81,102,0.6)' : '1px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ak-card p-5 max-w-md space-y-4">

        {/* KREDIT */}
        {tab === 'kredit' && <>
          <h2 className="font-display text-xl tracking-wide text-white">KREDITRECHNER</h2>
          <Field label="Betrag (€)"         value={kBetrag} onChange={setKBetrag}/>
          <Field label="Zinssatz (% p.a.)"  value={kZins}   onChange={setKZins}/>
          <Field label="Laufzeit (Jahre)"   value={kLauf}   onChange={setKLauf}/>
          <Result label="Monatliche Rate" value={`${fmt(kreditRate())} €`}
            sub={`Gesamt: ${fmt(kreditRate()*parseFloat(kLauf)*12)} €`}/>
        </>}

        {/* ZINS */}
        {tab === 'zins' && <>
          <h2 className="font-display text-xl tracking-wide text-white">ZINSESZINS</h2>
          <Field label="Startkapital (€)"  value={zKap}   onChange={setZKap}/>
          <Field label="Zinssatz (%)"       value={zZins}  onChange={setZZins}/>
          <Field label="Jahre"              value={zJahre} onChange={setZJahre}/>
          <Result label={`Endkapital nach ${zJahre} Jahren`}
            value={`${fmt(zinsResult())} €`}
            sub={`Gewinn: +${fmt(zinsResult()-parseFloat(zKap))} €`}
            accent="#E8A832"/>
        </>}

        {/* ALG I */}
        {tab === 'alg' && <>
          <h2 className="font-display text-xl tracking-wide text-white">ALG I RECHNER</h2>
          <p className="text-xs text-cement">ALG I = 60% (ohne Kind) bzw. 67% (mit Kind) des letzten Nettogehalts.</p>
          <Field label="Letztes Nettoeinkommen (€)" value={aGehalt} onChange={setAGehalt}/>
          <div>
            <label className="text-xs text-cement uppercase tracking-wider block mb-2">Kind mit Kindergeldanspruch?</label>
            <div className="flex gap-2">
              {(['nein','ja'] as const).map(v => (
                <button key={v} onClick={() => setAKinder(v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: aKinder===v ? '#C8392B' : 'rgba(255,255,255,0.06)', color: aKinder===v?'white':'#9AA0A6' }}>
                  {v==='ja'?'Ja (67%)':'Nein (60%)'}
                </button>
              ))}
            </div>
          </div>
          <Result label="Monatliches ALG I (ca.)"
            value={`${fmt(algResult())} €`}
            sub="Richtwert · genaue Berechnung via Bundesagentur"/>
        </>}

        {/* WÄHRUNG */}
        {tab === 'waehrung' && <>
          <h2 className="font-display text-xl tracking-wide text-white">WÄHRUNGSRECHNER</h2>
          <Field label="Betrag" value={wBetrag} onChange={setWBetrag}/>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cement uppercase tracking-wider block mb-1">Von</label>
              <select className="ak-input" value={wVon} onChange={e => setWVon(e.target.value)}>
                {Object.keys(RATES).map(c => <option key={c} style={{ background:'#1e2e40' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-cement uppercase tracking-wider block mb-1">Nach</label>
              <select className="ak-input" value={wNach} onChange={e => setWNach(e.target.value)}>
                {Object.keys(RATES).map(c => <option key={c} style={{ background:'#1e2e40' }}>{c}</option>)}
              </select>
            </div>
          </div>
          <Result label={`${wBetrag} ${wVon} =`}
            value={`${fmt(waehrResult())} ${wNach}`}
            sub="Richtwert · Kurs kann abweichen"/>
        </>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div>
      <label className="text-xs text-cement uppercase tracking-wider block mb-1">{label}</label>
      <input className="ak-input" type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  )
}

function Result({ label, value, sub, accent='#C8392B' }: { label:string; value:string; sub?:string; accent?:string }) {
  return (
    <div className="rechner-output rounded-2xl p-5 text-center mt-2" style={{ background:'var(--card2)' }}>
      <div className="text-xs text-cement uppercase tracking-wider mb-2">{label}</div>
      <div className="font-display text-4xl tracking-wide" style={{ color:'var(--sand)' }}>{value}</div>
      {sub && <div className="text-xs mt-2 font-mono" style={{ color: accent }}>{sub}</div>}
    </div>
  )
}
