import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { AlertCircle, Info } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)

interface TaxTip {
  id: string; icon: string; title: string; desc: string; limit?: string
  category: string[]; color: string
}

const ALL_TIPS: TaxTip[] = [
  { id:'homeoffice',     icon:'🏠', title:'Homeoffice-Pauschale',   desc:'Bis zu 210 Tage × 6€ = 1.260€ ohne Einzelnachweis absetzbar.',   limit:'Max. 1.260€/Jahr',        category:['Wohnen','Abos'],        color:'#3B82F6' },
  { id:'fahrtkosten',    icon:'🚗', title:'Pendlerpauschale',        desc:'0,30€ pro km (ab 21. km: 0,38€) für jeden Arbeitstag.',          limit:'0,30€/km einfache Strecke',category:['Transport'],            color:'#22C55E' },
  { id:'arbeitsmittel',  icon:'💻', title:'Arbeitsmittel',           desc:'PC, Schreibtisch, Bürostuhl bei beruflicher Nutzung absetzbar.',  limit:'Sofortabschreibung bis 952€',category:['Bildung','Abos'],      color:'#8B5CF6' },
  { id:'weiterbildung',  icon:'📚', title:'Weiterbildung',           desc:'Kurse, Bücher und Fachzeitschriften voll absetzbar.',            limit:'Unbegrenzt',               category:['Bildung'],              color:'#F59E0B' },
  { id:'kranken',        icon:'💊', title:'Krankenversicherung',     desc:'Beiträge zählen als Sonderausgaben.',                            limit:'Bis 1.900€/Jahr',          category:['Gesundheit'],           color:'#EF4444' },
  { id:'handwerker',     icon:'🔧', title:'Handwerkerleistungen',    desc:'20% der Arbeitskosten direkt von der Steuer abziehbar.',         limit:'Max. 1.200€ Ersparnis',    category:['Wohnen'],               color:'#F97316' },
  { id:'spenden',        icon:'❤️', title:'Spenden',                 desc:'Bis 300€ reicht der Kontoauszug als Nachweis.',                  limit:'Bis 20% des Gesamtbetrags',category:['Sonstiges'],            color:'#EC4899' },
  { id:'riester',        icon:'📈', title:'Altersvorsorge',          desc:'Riester/Rürup-Beiträge als Sonderausgaben + staatliche Zulage.', limit:'Bis 2.100€/Jahr',          category:['Sonstiges','Sparen'],   color:'#14B8A6' },
]

export function SteuerPage() {
  const { transactions } = useStore()

  const usedCats = useMemo(()=>new Set(transactions.map(t=>t.category)),[transactions])
  const yearSpend = useMemo(()=>{
    const now=new Date(), map:Record<string,number>={}
    transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===now.getFullYear()&&t.type==='expense'})
      .forEach(t=>{map[t.category]=(map[t.category]??0)+t.amount})
    return map
  },[transactions])

  const relevant = ALL_TIPS.filter(t=>t.category.some(c=>usedCats.has(c)))
  const other    = ALL_TIPS.filter(t=>!t.category.some(c=>usedCats.has(c)))

  const potentialSavings = relevant.length * 200

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Steuern</h1>
        <p style={{ fontSize:15,color:'var(--secondary)',marginTop:4 }}>Tipps & Abzüge</p>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:'0 20px 20px' }}>
        <div style={{ background:'rgba(59,130,246,0.08)',borderRadius:16,padding:'14px 16px',display:'flex',gap:12,border:'1px solid rgba(59,130,246,0.15)' }}>
          <AlertCircle width={18} height={18} style={{ color:'#3B82F6',flexShrink:0,marginTop:1 }}/>
          <div>
            <p style={{ fontSize:14,fontWeight:600,color:'var(--primary)',marginBottom:2 }}>Kein Steuerberater-Ersatz</p>
            <p style={{ fontSize:13,color:'var(--secondary)',lineHeight:1.5 }}>Allgemeine Hinweise. Für deine Situation empfehlen wir einen Steuerberater oder ELSTER.</p>
          </div>
        </div>
      </div>

      {/* Steuerübersicht */}
      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ padding:20 }}>
          <p style={{ fontSize:12,color:'var(--tertiary)',fontWeight:600,marginBottom:8 }}>
            Steuerpotenzial
          </p>
          <p style={{ fontSize:30,fontWeight:800,color:'var(--primary)',letterSpacing:'-0.04em' }}>
            {relevant.length}
          </p>
          <p style={{ fontSize:14,color:'var(--secondary)',marginTop:4 }}>
            relevante Steuer-Tipps erkannt
          </p>

          <div style={{
            marginTop:14,
            padding:'12px 14px',
            borderRadius:12,
            background:'var(--bg)'
          }}>
            <p style={{ fontSize:12,color:'var(--secondary)' }}>
              Mögliches Sparpotenzial bis ca. <strong>{fmt(potentialSavings)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Relevant */}
      {relevant.length>0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
            <p style={{ fontSize:17,fontWeight:700,color:'var(--primary)' }}>Für dich relevant</p>
            <span style={{ fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:20,background:'rgba(229,72,63,0.1)',color:'var(--accent)' }}>{relevant.length}</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {relevant.map((tip,i)=>{
              const relSpend = tip.category.filter(c=>usedCats.has(c)).reduce((s,c)=>s+(yearSpend[c]??0),0)
              return (
                <motion.div key={tip.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <div className="app-card">
                    <div style={{ display:'flex',alignItems:'flex-start',gap:14 }}>
                      <div style={{ width:52,height:52,borderRadius:16,background:`${tip.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:22 }}>
                        {tip.icon}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                          <p style={{ fontSize:16,fontWeight:700,color:'var(--primary)' }}>{tip.title}</p>
                          {tip.limit && <span style={{ fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,background:`${tip.color}18`,color:tip.color,whiteSpace:'nowrap',marginLeft:8,flexShrink:0 }}>{tip.limit}</span>}
                        </div>
                        <p style={{ fontSize:13,color:'var(--secondary)',lineHeight:1.5 }}>{tip.desc}</p>
                        {relSpend>0 && (
                          <div style={{ marginTop:10,background:'var(--bg)',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:8 }}>
                            <Info width={12} height={12} style={{ color:tip.color,flexShrink:0 }}/>
                            <p style={{ fontSize:12,color:'var(--secondary)' }}>
                              Du hast in passenden Kategorien bereits <span style={{ fontWeight:600,color:tip.color }}>{fmt(relSpend)}</span> erfasst.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {relevant.length > 0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <div className="app-card" style={{ padding:18 }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',fontWeight:600,marginBottom:10 }}>
              Häufig übersehen
            </p>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <p style={{ fontSize:14,color:'var(--primary)' }}>🏠 Homeoffice-Pauschale</p>
              <p style={{ fontSize:14,color:'var(--primary)' }}>📚 Weiterbildung & Fachliteratur</p>
              <p style={{ fontSize:14,color:'var(--primary)' }}>🔧 Handwerkerleistungen</p>
            </div>
          </div>
        </div>
      )}

      {/* Other */}
      {other.length>0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <p style={{ fontSize:17,fontWeight:700,color:'var(--primary)',marginBottom:12 }}>Weitere Tipps</p>
          <div className="app-card" style={{ padding:0,overflow:'hidden',opacity:0.6 }}>
            {other.map((tip,i)=>(
              <div key={tip.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<other.length-1?'1px solid var(--border)':'none' }}>
                <span style={{ fontSize:20 }}>{tip.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14,fontWeight:600,color:'var(--primary)' }}>{tip.title}</p>
                  <p style={{ fontSize:12,color:'var(--tertiary)' }}>{tip.limit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions.length===0 && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:12 }}>
          <p style={{ fontSize:56 }}>📊</p>
          <p style={{ fontSize:15,color:'var(--tertiary)',textAlign:'center' }}>Trag erst Ausgaben ein —{'\n'}dann zeigen wir dir relevante Tipps.</p>
        </div>
      )}
    </div>
  )
}
