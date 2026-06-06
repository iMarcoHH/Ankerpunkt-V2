import { useState } from 'react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const fmtPct = (v: number) => v.toFixed(2) + '%'

type Mode = 'kredit'|'zins'|'waehrung'|'sparplan'|'inflation'|'etf'

export function RechnerPage() {
  const [mode, setMode] = useState<Mode>('kredit')

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Rechner</h1>
      </div>

      {/* Rechner Auswahl */}
      <div style={{ padding:'0 20px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            ['kredit','💳','Kredit'],
            ['zins','📈','Zinseszins'],
            ['sparplan','💰','Sparplan'],
            ['waehrung','🌍','Währung'],
            ['inflation','📉','Inflation'],
            ['etf','📊','ETF']
          ].map(([v,icon,label]) => (
            <button
              key={v}
              onClick={() => setMode(v as Mode)}
              className="app-card"
              style={{
                padding:16,
                border:'none',
                cursor:'pointer',
                textAlign:'left',
                background: mode===v ? 'rgba(229,72,63,0.08)' : undefined,
                outline: mode===v ? '2px solid rgba(229,72,63,0.15)' : 'none'
              }}
            >
              <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ padding:18 }}>
          <p style={{ fontSize:12,color:'var(--tertiary)',fontWeight:600,marginBottom:6 }}>
            Finanzrechner
          </p>
          <p style={{ fontSize:16,fontWeight:700,color:'var(--primary)',marginBottom:4 }}>
            Schnell berechnen statt schätzen
          </p>
          <p style={{ fontSize:13,color:'var(--secondary)' }}>
            Praktische Finanzrechner für Kredit, Vermögensaufbau und Währungen.
          </p>
        </div>
      </div>

      <div style={{ padding:'0 20px' }}>
        {mode==='kredit'  && <KreditRechner/>}
        {mode==='zins'    && <ZinsRechner/>}
        {mode==='waehrung'&& <WaehrungsRechner/>}
        {mode==='sparplan'&& <SparplanRechner/>}
        {mode==='inflation'&& <InflationsRechner/>}
        {mode==='etf'&& <ETFRechner/>}
      </div>
    </div>
  )
}

function Card({ label, value, sub }: { label:string; value:string; sub?:string }) {
  return (
    <div className="app-card" style={{ textAlign:'center',marginTop:8 }}>
      <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:42,fontWeight:800,color:'var(--accent)',letterSpacing:'-0.03em' }}>{value}</p>
      {sub && <p style={{ fontSize:13,color:'var(--tertiary)',marginTop:4 }}>{sub}</p>}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type='number', prefix }: { label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:string;prefix?:string }) {
  return (
    <div>
      <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>{label}</p>
      <div style={{ position:'relative' }}>
        {prefix && <span style={{ position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:15,color:'var(--tertiary)',pointerEvents:'none' }}>{prefix}</span>}
        <input className="ak-input" type={type} inputMode="decimal" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
          style={{ paddingLeft:prefix?40:16 }}/>
      </div>
    </div>
  )
}

function KreditRechner() {
  const [betrag, setBetrag]     = useState('')
  const [zins,   setZins]       = useState('')
  const [laufzeit,setLaufzeit]  = useState('')

  const calc = () => {
    const P=parseFloat(betrag)||0, r=parseFloat(zins)/100/12, n=parseFloat(laufzeit)*12
    if (!P||!r||!n) return null
    const rate = P*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)
    return { rate, gesamt:rate*n, zinsen:rate*n-P }
  }
  const r = calc()

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label="Kreditbetrag" value={betrag} onChange={setBetrag} placeholder="20.000" prefix="€"/>
      <Field label="Zinssatz p.a." value={zins}   onChange={setZins}   placeholder="4.5"    prefix="%"/>
      <Field label="Laufzeit (Jahre)" value={laufzeit} onChange={setLaufzeit} placeholder="5"/>
      {r && (
        <>
          <Card label="Monatliche Kreditrate" value={fmt(r.rate)}/>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <div className="app-card" style={{ textAlign:'center',padding:16 }}>
              <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Gesamtkosten</p>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--primary)' }}>{fmt(r.gesamt)}</p>
            </div>
            <div className="app-card" style={{ textAlign:'center',padding:16 }}>
              <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Zinsen gesamt</p>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--accent)' }}>{fmt(r.zinsen)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ZinsRechner() {
  const [kapital,  setKapital]   = useState('')
  const [zins,     setZins]      = useState('')
  const [jahre,    setJahre]     = useState('')

  const calc = () => {
    const K=parseFloat(kapital)||0, p=parseFloat(zins)/100, n=parseFloat(jahre)||0
    if (!K||!p||!n) return null
    const endKapital = K*Math.pow(1+p,n)
    return { endKapital, gewinn:endKapital-K }
  }
  const r = calc()

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label="Startkapital" value={kapital} onChange={setKapital} placeholder="10.000" prefix="€"/>
      <Field label="Zinssatz p.a." value={zins} onChange={setZins} placeholder="5.0" prefix="%"/>
      <Field label="Laufzeit (Jahre)" value={jahre} onChange={setJahre} placeholder="10"/>
      {r && (
        <>
          <Card label="Endkapital" value={fmt(r.endKapital)}/>
          <div className="app-card" style={{ textAlign:'center',padding:16 }}>
            <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Gewinn</p>
            <p style={{ fontSize:22,fontWeight:700,color:'var(--success)' }}>+{fmt(r.gewinn)}</p>
          </div>
        </>
      )}
    </div>
  )
}

function WaehrungsRechner() {
  const RATES: Record<string,number> = { EUR:1, USD:1.08, GBP:0.86, CHF:0.96, JPY:160, SEK:11.2, NOK:11.5, DKK:7.46, CAD:1.47, AUD:1.66 }
  const [amount, setAmount] = useState('')
  const [from,   setFrom]   = useState('EUR')
  const [to,     setTo]     = useState('USD')

  const result = parseFloat(amount) ? (parseFloat(amount)/RATES[from])*RATES[to] : null
  const currencies = Object.keys(RATES)

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label="Betrag" value={amount} onChange={setAmount} placeholder="100"/>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        {[['Von',from,setFrom],['Nach',to,setTo]].map(([label,val,setter]:any)=>(
          <div key={label}>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>{label}</p>
            <select className="ak-input" value={val} onChange={e=>setter(e.target.value)}>
              {currencies.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ))}
      </div>
      {result!==null && <Card label={`${amount} ${from} =`} value={`${result.toFixed(2)} ${to}`} sub="Richtwert · kein Echtzeit-Kurs"/>}
    </div>
  )
}

function SparplanRechner() {
  const [rate,   setRate]   = useState('')
  const [zins,   setZins]   = useState('')
  const [jahre,  setJahre]  = useState('')

  const calc = () => {
    const r=parseFloat(rate)||0, p=parseFloat(zins)/100/12, n=parseFloat(jahre)*12
    if (!r||!n) return null
    const endKapital = p>0 ? r*((Math.pow(1+p,n)-1)/p) : r*n
    return { endKapital, eingezahlt:r*n, gewinn:endKapital-(r*n) }
  }
  const res = calc()

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label="Monatliche Rate" value={rate}  onChange={setRate}  placeholder="200" prefix="€"/>
      <Field label="Zinssatz p.a."   value={zins}  onChange={setZins}  placeholder="5.0" prefix="%"/>
      <Field label="Laufzeit (Jahre)"value={jahre} onChange={setJahre} placeholder="20"/>
      {res && (
        <>
          <Card label="Endkapital" value={fmt(res.endKapital)}/>
          <div className="app-card" style={{ textAlign:'center',padding:14 }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',marginBottom:4 }}>Rendite</p>
            <p style={{ fontSize:20,fontWeight:800,color:'var(--success)' }}>
              {fmtPct((res.gewinn / res.eingezahlt) * 100)}
            </p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <div className="app-card" style={{ textAlign:'center',padding:16 }}>
              <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Eingezahlt</p>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--primary)' }}>{fmt(res.eingezahlt)}</p>
            </div>
            <div className="app-card" style={{ textAlign:'center',padding:16 }}>
              <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Zinsen</p>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--success)' }}>+{fmt(res.gewinn)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function InflationsRechner() {
  const [betrag,setBetrag] = useState('')
  const [inflation,setInflation] = useState('2')
  const [jahre,setJahre] = useState('10')

  const start = parseFloat(betrag)||0
  const rate = (parseFloat(inflation)||0)/100
  const years = parseFloat(jahre)||0

  const kaufkraft = start ? start / Math.pow(1+rate, years) : 0

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label='Heutiger Betrag' value={betrag} onChange={setBetrag} placeholder='10000' prefix='€'/>
      <Field label='Inflation p.a.' value={inflation} onChange={setInflation} placeholder='2' prefix='%'/>
      <Field label='Jahre' value={jahre} onChange={setJahre} placeholder='10'/>
      {start>0 && (
        <>
          <Card label='Kaufkraft in der Zukunft' value={fmt(kaufkraft)}/>
          <div className='app-card' style={{ textAlign:'center',padding:16 }}>
            <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Wertverlust</p>
            <p style={{ fontSize:20,fontWeight:800,color:'var(--accent)' }}>
              {fmt(start-kaufkraft)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function ETFRechner() {
  const [startkapital,setStartkapital] = useState('10000')
  const [rendite,setRendite] = useState('7')
  const [jahre,setJahre] = useState('20')

  const start = parseFloat(startkapital)||0
  const r = (parseFloat(rendite)||0)/100
  const y = parseFloat(jahre)||0

  const endwert = start * Math.pow(1+r,y)

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <Field label='Startkapital' value={startkapital} onChange={setStartkapital} placeholder='10000' prefix='€'/>
      <Field label='Rendite p.a.' value={rendite} onChange={setRendite} placeholder='7' prefix='%'/>
      <Field label='Jahre' value={jahre} onChange={setJahre} placeholder='20'/>
      {start>0 && (
        <>
          <Card label='ETF Endwert' value={fmt(endwert)}/>
          <div className='app-card' style={{ textAlign:'center',padding:16 }}>
            <p style={{ fontSize:11,color:'var(--tertiary)',marginBottom:4 }}>Gewinn</p>
            <p style={{ fontSize:20,fontWeight:800,color:'var(--success)' }}>
              +{fmt(endwert-start)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
