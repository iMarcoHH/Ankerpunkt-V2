import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { ChevronLeft, ChevronRight, ChevronRight as Arrow } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)

const MONTH_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MONTH_LONG  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

const CAT_ICONS: Record<string, string> = {
  Wohnen:'🏠', Lebensmittel:'🛒', Transport:'🚌', Abos:'📱',
  Gesundheit:'💊', Freizeit:'🎉', Kleidung:'👗', Bildung:'📚', Sonstiges:'💳',
}

export function DashboardPage() {
  const { transactions, insurances, goals, debts, setActiveTab,
          viewMonth, viewYear, goToPrevMonth, goToNextMonth, profile } = useStore()
  const avatarUrl = (profile as any)?.avatar_url ?? null

  const now            = new Date()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }), [transactions, viewMonth, viewYear])

  const income   = useMemo(() => monthTx.filter(t => t.type === 'income') .reduce((s,t) => s+t.amount, 0), [monthTx])
  const expense  = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0), [monthTx])
  const balance  = income - expense
  const savings  = income > 0 ? Math.round((balance/income)*100) : 0
  // Fixkosten: nur monatliche Versicherungen + monatlich wiederkehrende Ausgaben.
  // Jährliche Versicherungen werden bewusst NICHT auf Monate umgelegt.
  const fixedCosts = useMemo(() => {
    const monthlyInsurance = insurances
      .filter(i => i.recurrence === 'monthly')
      .reduce((s, i) => s + i.amount, 0)

    const recurringExpenses = monthTx
      .filter((t: any) =>
        t.type === 'expense' &&
        (t.recurring === true || t.isRecurring === true || t.frequency === 'monthly' || t.recurrence === 'monthly')
      )
      .reduce((s, t) => s + t.amount, 0)

    return monthlyInsurance + recurringExpenses
  }, [insurances, monthTx])
  const debtLeft   = debts.reduce((s,d) => s + (d.total_amount - d.paid_amount), 0)
  const firstName  = (profile as any)?.full_name?.split(' ')[0] ?? ''

  // Nächste Schuld/Rate
  const nextDebt = debts.find(d => d.monthly_rate > 0 && d.paid_amount < d.total_amount)

  // Top Ausgaben
  const topExp = useMemo(() => {
    const map: Record<string,number> = {}
    monthTx.filter(t => t.type==='expense').forEach(t => { map[t.description] = (map[t.description]??0)+t.amount })
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,4)
  }, [monthTx])

  // Finanzen Zeilen
  const finRows = [
    { label:'Einnahmen', value:income,  color:'var(--success)', arrow: true },
    { label:'Ausgaben',  value:expense, color:'var(--accent)',  arrow: true },
    { label:'Netto',     value:balance, color:'var(--primary)', arrow: true },
  ]

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:15, color:'var(--secondary)', marginBottom:2 }}>
            Guten {new Date().getHours()<12?'Morgen':new Date().getHours()<18?'Tag':'Abend'}{firstName ? `, ${firstName}` : ''} 👋
          </p>
          <h1 className="page-title">Deine Finanzen</h1>
        </div>
        <button onClick={() => setActiveTab('profil')}
          style={{ width:44, height:44, borderRadius:14, overflow:'hidden', flexShrink:0, marginTop:4,
                   background:'var(--accent)', border:'none', cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="Avatar"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : <span style={{ color:'white', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                {(firstName?.[0] || 'A').toUpperCase()}
              </span>
          }
        </button>
      </div>

      {/* Hero Card */}
      <div style={{ padding:'0 20px 20px' }}>
        <div className="accent-card">
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:4, position:'relative', zIndex:1 }}>Aktueller Stand</p>
          <p style={{ fontSize:36, fontWeight:800, color:'white', letterSpacing:'-0.03em', marginBottom:2, position:'relative', zIndex:1 }}>
            {fmt(balance)}
          </p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginBottom:20, position:'relative', zIndex:1 }}>
            {MONTH_LONG[viewMonth]} {viewYear}
          </p>
          <div style={{ display:'flex', gap:24, position:'relative', zIndex:1 }}>
            <div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginBottom:2 }}>Einnahmen</p>
              <p style={{ fontSize:17, fontWeight:700, color:'white' }}>{fmt(income)}</p>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginBottom:2 }}>Ausgaben</p>
              <p style={{ fontSize:17, fontWeight:700, color:'white' }}>{fmt(expense)}</p>
            </div>
          </div>

          {/* Monat Nav */}
          <div style={{ position:'absolute', top:20, right:20, zIndex:2, display:'flex', gap:4 }}>
            <button onClick={goToPrevMonth} style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.2)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <ChevronLeft width={14} height={14} style={{ color:'white' }}/>
            </button>
            <button onClick={goToNextMonth} disabled={isCurrentMonth} style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.2)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:isCurrentMonth?0.4:1 }}>
              <ChevronRight width={14} height={14} style={{ color:'white' }}/>
            </button>
          </div>
        </div>
      </div>

      {/* Auf einen Blick */}
      <div style={{ padding:'0 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 className="section-title">Auf einen Blick</h2>
        </div>
        <div className="app-card" style={{ padding:0, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', overflow:'hidden' }}>
          {[
            { label:'Sparquote',    value:`${savings} %`,     color: savings>=20?'var(--success)':'var(--accent)' },
            { label:'Fixkosten', value:fmt(fixedCosts),    color:'var(--primary)' },
            { label:'Schulden',     value:fmt(debtLeft),      color: debtLeft>0?'var(--accent)':'var(--success)' },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{ padding:'16px 12px', borderRight: i<2?'1px solid var(--border)':'none', textAlign:'center' }}>
              <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:4, fontWeight:500 }}>{label}</p>
              <p style={{ fontSize:16, fontWeight:700, color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deine Finanzen */}
      <div style={{ padding:'0 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 className="section-title">Deine Finanzen</h2>
          <span style={{ fontSize:13, color:'var(--tertiary)', fontWeight:500 }}>
            {MONTH_LONG[viewMonth]} ›
          </span>
        </div>
        <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
          {finRows.map(({ label, value, color, arrow }, i) => (
            <button key={label}
              onClick={() => setActiveTab(label==='Einnahmen'||label==='Ausgaben'?'buchungen':'analysen')}
              style={{ width:'100%', display:'flex', alignItems:'center', padding:'14px 20px',
                       background:'none', border:'none', borderBottom: i<2?'1px solid var(--border)':'none',
                       cursor:'pointer', WebkitTapHighlightColor:'transparent' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)',
                            display:'flex', alignItems:'center', justifyContent:'center', marginRight:12, flexShrink:0, fontSize:16 }}>
                {label==='Einnahmen'?'📈':label==='Ausgaben'?'📉':'⚖️'}
              </div>
              <span style={{ flex:1, fontSize:15, fontWeight:500, color:'var(--primary)', textAlign:'left' }}>{label}</span>
              <span style={{ fontSize:15, fontWeight:700, color, marginRight:8 }}>{fmt(value)}</span>
              <Arrow width={14} height={14} style={{ color:'var(--tertiary)', flexShrink:0 }}/>
            </button>
          ))}
        </div>
      </div>

      {/* Nächste Zahlung */}
      {nextDebt && (
        <div style={{ padding:'0 20px 20px' }}>
          <h2 className="section-title" style={{ marginBottom:12 }}>Nächste Zahlung</h2>
          <button onClick={() => setActiveTab('schulden')}
            className="app-card"
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, cursor:'pointer', border:'none', textAlign:'left' }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'rgba(229,72,63,0.1)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
              🧾
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--primary)', marginBottom:2 }}>{nextDebt.name}</p>
              <p style={{ fontSize:13, color:'var(--tertiary)' }}>{fmt(nextDebt.monthly_rate)} / Monat</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <Arrow width={14} height={14} style={{ color:'var(--tertiary)' }}/>
            </div>
          </button>
        </div>
      )}

      {/* Top Ausgaben */}
      {topExp.length > 0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 className="section-title">Top Ausgaben</h2>
            <button onClick={() => setActiveTab('analysen')} style={{ fontSize:13, color:'var(--accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Alle</button>
          </div>
          <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
            {topExp.map(([desc, amount], i) => (
              <div key={desc} style={{ display:'flex', alignItems:'center', padding:'12px 20px',
                                       borderBottom: i<topExp.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:12, flexShrink:0 }}>
                  💳
                </div>
                <span style={{ flex:1, fontSize:15, fontWeight:500, color:'var(--primary)' }}>{desc}</span>
                <span style={{ fontSize:15, fontWeight:600, color:'var(--primary)', marginRight:8 }}>{fmt(amount)}</span>
                <Arrow width={14} height={14} style={{ color:'var(--tertiary)' }}/>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
