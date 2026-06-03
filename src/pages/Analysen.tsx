import { useMemo, useState } from 'react'
import { useStore } from '../store'

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const MONTH_LABELS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']

export function AnalysenPage() {
  const { transactions } = useStore()
  const [view, setView] = useState<'ausgaben' | 'einnahmen'>('ausgaben')

  const now   = new Date()
  const month = now.getMonth()
  const year  = now.getFullYear()

  const breakdown = useMemo(() => {
    const txType = view === 'ausgaben' ? 'expense' : 'income'
    const filtered = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year && t.type === txType
    })
    const map: Record<string, number> = {}
    filtered.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount })
    const total = Object.values(map).reduce((s, v) => s + v, 0)
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => ({ cat, amount, pct: total > 0 ? Math.round(amount / total * 100) : 0 }))
  }, [transactions, month, year, view])

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = i - 5
      const d = new Date(year, month + offset, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const income  = transactions.filter(t => { const td = new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='income'  }).reduce((s,t) => s+t.amount, 0)
      const expense = transactions.filter(t => { const td = new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='expense' }).reduce((s,t) => s+t.amount, 0)
      return { label: MONTH_LABELS[m], income, expense }
    })
  }, [transactions, month, year])

  const showDemo = transactions.length === 0

  const demoBreakdown = [
    { cat: 'Wohnen',    amount: 600, pct: 73 },
    { cat: 'Abos',      amount: 85,  pct: 10 },
    { cat: 'Transport', amount: 63,  pct: 8  },
    { cat: 'Sonstiges', amount: 70,  pct: 9  },
  ]
  const demoTrend = [
    { label: 'Jan', income: 4200, expense: 900  },
    { label: 'Feb', income: 4200, expense: 750  },
    { label: 'Mär', income: 4500, expense: 820  },
    { label: 'Apr', income: 4500, expense: 1100 },
    { label: 'Mai', income: 4500, expense: 680  },
    { label: 'Jun', income: 4500, expense: 818  },
  ]

  const displayBreakdown = showDemo ? demoBreakdown : breakdown
  const displayTrend     = showDemo ? demoTrend     : trend
  const maxVal = Math.max(...displayTrend.map(t => Math.max(t.income, t.expense)), 1)

  const CAT_COLORS = ['#C8392B','#0D1B2A','#E8A832','#3D5166','#9AA0A6','#E8DFD0']

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// 02 — Analysen</div>
        <div className="font-display text-white text-4xl tracking-wide">ANALYSEN</div>
        <div className="font-sans text-white/30 text-xs font-light mt-1">Wohin fließt dein Geld?</div>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Tabs */}
        <div className="flex gap-2 animate-in">
          {(['ausgaben','einnahmen'] as const).map(t => (
            <button key={t} onClick={() => setView(t)}
              className={`ak-tab flex-1 ${view===t ? 'active' : ''}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Bar chart ────────────────────────────────────────────────── */}
        <div className="ak-card p-4 animate-in-2">
          <div className="font-mono text-[10px] tracking-widest uppercase text-cement mb-3">6-Monats-Verlauf</div>
          <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 8, overflow: 'hidden' }}>
            {displayTrend.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 90 }}>
                  <div style={{
                    flex: 1,
                    background: '#E8A832',
                    opacity: 0.8,
                    borderRadius: '3px 3px 0 0',
                    height: `${Math.max(2, Math.round(m.income / maxVal * 90))}px`,
                  }}/>
                  <div style={{
                    flex: 1,
                    background: '#C8392B',
                    borderRadius: '3px 3px 0 0',
                    height: `${Math.max(2, Math.round(m.expense / maxVal * 90))}px`,
                  }}/>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#9AA0A6' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: '#E8A832', opacity: 0.8, borderRadius: 2 }}/>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#9AA0A6' }}>Einnahmen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: '#C8392B', borderRadius: 2 }}/>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#9AA0A6' }}>Ausgaben</span>
            </div>
          </div>
        </div>

        {/* ── Category breakdown ───────────────────────────────────────── */}
        <div className="animate-in-3">
          <div className="font-mono text-[10px] tracking-widest uppercase text-cement mb-3 flex items-center gap-2">
            <span>Kategorien · {now.toLocaleString('de-DE', { month: 'long' })}</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }}/>
          </div>

          {displayBreakdown.length === 0 ? (
            <div className="ak-card p-8 text-center">
              <p className="font-sans text-sm text-cement font-light">Noch keine Daten für diesen Monat.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayBreakdown.map(({ cat, amount, pct }, i) => (
                <div key={cat} className="ak-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}/>
                      <span className="font-sans text-sm font-medium text-navy">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-cement">{pct}%</span>
                      <span className="font-display text-navy text-lg">{fmt(amount)}€</span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Klartext ─────────────────────────────────────────────────── */}
        <div className="ak-card bg-navy p-4 animate-in-4" style={{ borderLeft: '3px solid #C8392B' }}>
          <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-2">// Klartext</div>
          {showDemo ? (
            <p className="font-sans text-sm text-white/60 font-light leading-relaxed">
              Dein größter Posten ist <span className="text-white font-medium">Wohnen (73%)</span> mit 600€.
              Du gibst 18% deines Einkommens aus — das ist sehr solide.
            </p>
          ) : breakdown.length === 0 ? (
            <p className="font-sans text-sm text-white/60 font-light">Noch keine Daten vorhanden.</p>
          ) : (
            <p className="font-sans text-sm text-white/60 font-light leading-relaxed">
              Dein größter Posten ist <span className="text-white font-medium">{breakdown[0]?.cat} ({breakdown[0]?.pct}%)</span> mit {fmt(breakdown[0]?.amount ?? 0)}€.
              {breakdown.length > 1 && <> Danach folgt <span className="text-white font-medium">{breakdown[1]?.cat}</span> mit {fmt(breakdown[1]?.amount ?? 0)}€.</>}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
