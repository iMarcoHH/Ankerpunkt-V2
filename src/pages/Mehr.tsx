import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { exportToCSV, exportToJSON } from '../lib/export'
import { Target, Shield, Calculator, Newspaper, StickyNote, UserCircle,
         Receipt, Trophy, BookOpen, ChevronRight, Download, PieChart,
         TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

const MEHR_ITEMS = [
  { section: 'Konto & Einstellungen', items: [
    { id: 'profil',         label: 'Profil & Einstellungen', Icon: UserCircle,  desc: 'Account, Dark Mode, Level' },
    { id: 'gamification',   label: 'Erfolge & XP',           Icon: Trophy,      desc: 'Achievements, Streak, Level' },
  ]},
  { section: 'Finanzen', items: [
    { id: 'ziele',          label: 'Sparziele',               Icon: Target,      desc: 'Ziele verfolgen' },
    { id: 'versicherungen', label: 'Versicherungen',          Icon: Shield,      desc: 'Policen im Überblick' },
    { id: 'steuern',        label: 'Steuer-Tipps',            Icon: Receipt,     desc: 'Abzüge & Hinweise' },
  ]},
  { section: 'Tools & Wissen', items: [
    { id: 'rechner',        label: 'Rechner',                 Icon: Calculator,  desc: 'Kredit, Zins, Währung' },
    { id: 'lexikon',        label: 'Finanz-Lexikon',          Icon: BookOpen,    desc: 'Begriffe einfach erklärt' },
    { id: 'news',           label: 'News',                    Icon: Newspaper,   desc: 'Wirtschaft & Finanzen' },
    { id: 'notizen',        label: 'Notizen',                 Icon: StickyNote,  desc: 'Persönliche Notizen' },
  ]},
]

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)

export function MehrPage() {
  const { setActiveTab, transactions, insurances, goals, debts, userId } = useStore()
  const [score, setScore]         = useState<any>(null)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [showBudgets, setShowBudgets]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showScoreDetails, setShowScoreDetails] = useState(false)

  useEffect(() => {
    if (!userId) return
    setScoreLoading(true)
    async function loadScore() {
      try {
        const { data } = await supabase.rpc('get_financial_health_score', { p_user_id: userId })
        if (data) setScore(data)
      } catch(e) { console.error(e) }
      setScoreLoading(false)
    }
    loadScore()
  }, [userId])

  function handleExportCSV() {
    setExporting(true)
    try { exportToCSV(transactions) }
    finally { setExporting(false) }
  }

  function handleExportJSON() {
    setExporting(true)
    try {
      exportToJSON({
        transactions,
        insurances,
        goals,
        debts,
        exportedAt: new Date().toISOString(),
      }, 'ankerpunkt-backup.json')
    } finally { setExporting(false) }
  }

  const scoreColor = !score ? 'var(--tertiary)'
    : score.score >= 80 ? 'var(--success)'
    : score.score >= 60 ? 'var(--warning)'
    : score.score >= 40 ? 'var(--secondary)'
    : 'var(--accent)'

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <p className="page-title">Mehr</p>
      </div>

      {/* Finanz-Score Card */}
      <div style={{ padding:'0 20px 16px' }}>
        <div
          className="app-card"
          onClick={() => setShowScoreDetails(!showScoreDetails)}
          style={{ cursor:'pointer' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(229,72,63,0.1)',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                <TrendingUp width={20} height={20} style={{ color:'var(--accent)' }}/>
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--primary)' }}>Finanz-Score</p>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>Basierend auf deinen Daten</p>
              </div>
            </div>
            {scoreLoading
              ? <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--accent)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
                </div>
              : score && (
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:32, fontWeight:800, color:scoreColor, letterSpacing:'-0.03em', lineHeight:1 }}>{score.score}</p>
                  <p style={{ fontSize:11, fontWeight:600, color:scoreColor }}>{score.label}</p>
                </div>
              )
            }
          </div>

          {score && (
            <>
              <div style={{ height:8, borderRadius:4, background:'var(--bg)', overflow:'hidden', marginBottom:12 }}>
                <div style={{ height:'100%', borderRadius:4, background:scoreColor, width:`${score.score}%`, transition:'width 1s ease' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'var(--bg)' }}>
                  <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:2 }}>Sparquote</p>
                  <p style={{ fontSize:14, fontWeight:700, color: score.savings_rate >= 20 ? 'var(--success)' : 'var(--accent)' }}>{score.savings_rate}%</p>
                </div>
                <div style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'var(--bg)' }}>
                  <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:2 }}>Schulden</p>
                  <p style={{ fontSize:14, fontWeight:700, color: score.debt_total > 0 ? 'var(--accent)' : 'var(--success)' }}>{score.debt_total > 0 ? fmt(score.debt_total) : '✓'}</p>
                </div>
                <div style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'var(--bg)' }}>
                  <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:2 }}>Versicherungen</p>
                  <p style={{ fontSize:14, fontWeight:700, color: score.insurances >= 2 ? 'var(--success)' : 'var(--warning)' }}>{score.insurances}x</p>
                </div>
              </div>
              <p style={{ marginTop:12, fontSize:12, color:'var(--tertiary)', textAlign:'center' }}>
                {showScoreDetails ? 'Tippen zum Ausblenden' : 'Tippen für Details'}
              </p>
              {showScoreDetails && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>
                    So wird dein Score berechnet
                  </p>

                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'var(--secondary)' }}>Sparquote über 20%</span>
                      <span style={{ fontSize:13, fontWeight:700, color: score.savings_rate >= 20 ? 'var(--success)' : 'var(--accent)' }}>
                        {score.savings_rate >= 20 ? '✓ Stark' : 'Verbesserbar'}
                      </span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'var(--secondary)' }}>Versicherungsabdeckung</span>
                      <span style={{ fontSize:13, fontWeight:700, color: score.insurances >= 2 ? 'var(--success)' : 'var(--warning)' }}>
                        {score.insurances >= 2 ? '✓ Gut' : 'Prüfen'}
                      </span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'var(--secondary)' }}>Schuldenstand</span>
                      <span style={{ fontSize:13, fontWeight:700, color: score.debt_total > 0 ? 'var(--accent)' : 'var(--success)' }}>
                        {score.debt_total > 0 ? 'Belastung vorhanden' : '✓ Schuldenfrei'}
                      </span>
                    </div>

                    <div style={{ marginTop:8, padding:12, borderRadius:12, background:'var(--bg)' }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>
                        Nächster Schritt
                      </p>
                      <p style={{ fontSize:12, color:'var(--secondary)', lineHeight:1.5 }}>
                        {score.savings_rate < 20
                          ? 'Erhöhe deine Sparquote auf mindestens 20%, um deinen Score zu verbessern.'
                          : score.debt_total > 0
                          ? 'Reduziere offene Schulden, um deine finanzielle Gesundheit zu steigern.'
                          : score.insurances < 2
                          ? 'Prüfe wichtige Versicherungen für eine bessere Absicherung.'
                          : 'Deine Finanzen sind gut aufgestellt. Halte deinen aktuellen Kurs.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Kategorie-Budgets */}
      <div style={{ padding:'0 20px 16px' }}>
        <button onClick={() => setShowBudgets(true)}
          className="app-card"
          style={{ width:'100%', display:'flex', alignItems:'center', gap:14, cursor:'pointer', border:'none', textAlign:'left' }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(34,197,94,0.1)',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <PieChart width={20} height={20} style={{ color:'var(--success)' }}/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:700, color:'var(--primary)' }}>Kategorie-Budgets</p>
            <p style={{ fontSize:13, color:'var(--tertiary)' }}>Ausgaben-Limits pro Kategorie</p>
          </div>
          <ChevronRight width={16} height={16} style={{ color:'var(--tertiary)' }}/>
        </button>
      </div>

      {/* Export */}
      <div style={{ padding:'0 20px 16px' }}>
        <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Export</p>
        <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
          <button onClick={handleExportCSV} disabled={exporting}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                     background:'none', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(34,197,94,0.1)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Download width={16} height={16} style={{ color:'var(--success)' }}/>
            </div>
            <div style={{ flex:1, textAlign:'left' }}>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--primary)' }}>CSV exportieren</p>
              <p style={{ fontSize:13, color:'var(--tertiary)' }}>{transactions.length} Buchungen · Excel-kompatibel</p>
            </div>
            <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)' }}/>
          </button>
          <button onClick={handleExportJSON} disabled={exporting}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                     background:'none', border:'none', cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.1)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Download width={16} height={16} style={{ color:'#3B82F6' }}/>
            </div>
            <div style={{ flex:1, textAlign:'left' }}>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--primary)' }}>Backup (JSON)</p>
              <p style={{ fontSize:13, color:'var(--tertiary)' }}>Alle Daten · Vollständiges Backup</p>
            </div>
            <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)' }}/>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      {MEHR_ITEMS.map(({ section, items }) => (
        <div key={section} style={{ padding:'0 20px 16px' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
            {section}
          </p>
          <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
            {items.map(({ id, label, Icon, desc }, i) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                         background:'none', border:'none',
                         borderBottom: i < items.length-1 ? '1px solid var(--border)' : 'none',
                         cursor:'pointer', WebkitTapHighlightColor:'transparent', textAlign:'left' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'var(--bg)',
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon width={18} height={18} style={{ color:'var(--accent)' }} strokeWidth={1.75}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--primary)', marginBottom:1 }}>{label}</p>
                  <p style={{ fontSize:13, color:'var(--tertiary)' }}>{desc}</p>
                </div>
                <ChevronRight width={16} height={16} style={{ color:'var(--tertiary)', flexShrink:0 }}/>
              </button>
            ))}
          </div>
        </div>
      ))}

      {showBudgets && <BudgetsSheet onClose={() => setShowBudgets(false)}/>}
    </div>
  )
}

// ── Kategorie-Budgets Sheet ──────────────────────────────────────────────────
import { CATEGORIES_EXPENSE } from '../lib/supabase'
import { X } from 'lucide-react'

function BudgetsSheet({ onClose }: { onClose:()=>void }) {
  const { budgets, setBudgets, userId, transactions } = useStore()
  const [vals, setVals] = useState<Record<string,string>>({})
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const thisMonthExp = (cat: string) =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear() && t.type==='expense' && t.category===cat
    }).reduce((s,t)=>s+t.amount,0)

  async function saveBudget(cat: string) {
    const amount = parseFloat(vals[cat]||'0')
    if (!amount || !userId) return
    setSaving(true)
    const existing = budgets.find(b => b.category===cat)
    if (existing) {
      await supabase.from('category_budgets').update({ amount }).eq('id', existing.id)
      setBudgets(budgets.map(b => b.category===cat ? {...b, amount} : b))
    } else {
      const { data } = await supabase.from('category_budgets').insert({ user_id:userId, category:cat, amount }).select().single()
      if (data) setBudgets([...budgets, data])
    }
    setVals(v => ({...v,[cat]:''}))
    setSaving(false)
  }

  async function removeBudget(cat: string) {
    const existing = budgets.find(b => b.category===cat)
    if (!existing) return
    await supabase.from('category_budgets').delete().eq('id', existing.id)
    setBudgets(budgets.filter(b => b.category!==cat))
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet" style={{ maxHeight:'85dvh' }}>
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 20px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:20,fontWeight:800,color:'var(--primary)' }}>Kategorie-Budgets</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <p style={{ fontSize:13,color:'var(--tertiary)',marginBottom:16,lineHeight:1.5 }}>
          Setze monatliche Limits pro Kategorie. Bei Überschreitung wird eine Warnung angezeigt.
        </p>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {CATEGORIES_EXPENSE.map(cat => {
            const budget  = budgets.find(b=>b.category===cat)
            const spent   = thisMonthExp(cat)
            const pct     = budget ? Math.min(100, (spent/budget.amount)*100) : 0
            const over    = budget && spent > budget.amount
            return (
              <div key={cat} className="app-card" style={{ padding:14, border: over?'1.5px solid rgba(229,72,63,0.3)':'1px solid var(--border)' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                  <p style={{ fontSize:14,fontWeight:600,color:'var(--primary)' }}>{cat}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    {over && <AlertTriangle width={14} height={14} style={{ color:'var(--accent)' }}/>}
                    {budget && <CheckCircle width={14} height={14} style={{ color:'var(--success)' }}/>}
                    <p style={{ fontSize:13,color:'var(--tertiary)' }}>{fmt(spent)} ausgegeben</p>
                  </div>
                </div>

                {budget && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ height:4,borderRadius:2,background:'var(--bg)',overflow:'hidden',marginBottom:4 }}>
                      <div style={{ height:'100%',borderRadius:2,background:over?'var(--accent)':'var(--success)',width:`${pct}%` }}/>
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between' }}>
                      <p style={{ fontSize:11,color:'var(--tertiary)' }}>{pct.toFixed(0)}% von {fmt(budget.amount)}</p>
                      <button onClick={()=>removeBudget(cat)} style={{ fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer' }}>Entfernen</button>
                    </div>
                  </div>
                )}

                <div style={{ display:'flex',gap:8 }}>
                  <input className="ak-input" type="number" inputMode="decimal"
                    style={{ height:40,flex:1 }}
                    placeholder={budget ? `Aktuell: ${fmt(budget.amount)}` : 'Budget in €'}
                    value={vals[cat]||''}
                    onChange={e=>setVals(v=>({...v,[cat]:e.target.value}))}
                  />
                  <button onClick={()=>saveBudget(cat)} disabled={saving||!vals[cat]}
                    style={{ height:40,padding:'0 16px',borderRadius:12,background:'var(--accent)',border:'none',color:'white',fontWeight:600,fontSize:13,cursor:'pointer',opacity:vals[cat]?1:0.4 }}>
                    ✓
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
