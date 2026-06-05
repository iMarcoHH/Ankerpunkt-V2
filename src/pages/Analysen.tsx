import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
         PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)
const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const PIE_COLS = ['#E5483F','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899']
type Tab = 'cashflow'|'vergleich'|'kategorien'

export function AnalysenPage() {
  const { transactions } = useStore()
  const [tab, setTab] = useState<Tab>('cashflow')
  const now = new Date()

  const cashflow = useMemo(() => Array.from({length:12},(_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-11+i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'}).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense'}).reduce((s,t)=>s+t.amount,0)
    return { month:MONTHS[m], income:inc, expenses:exp, netto:inc-exp }
  }), [transactions])

  const cats = useMemo(() => {
    const map: Record<string,number> = {}
    transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()&&t.type==='expense'}).forEach(t=>{map[t.category]=(map[t.category]??0)+t.amount})
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({category:c,total:v}))
  }, [transactions])
  const catTotal = cats.reduce((s,c)=>s+c.total,0)

  const tm=now.getMonth(),ty=now.getFullYear(),lm=tm===0?11:tm-1,ly=tm===0?ty-1:ty
  const get=(m:number,y:number,type:'income'|'expense')=>transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===y&&t.type===type}).reduce((s,t)=>s+t.amount,0)
  const comp = { tI:get(tm,ty,'income'),tE:get(tm,ty,'expense'),lI:get(lm,ly,'income'),lE:get(lm,ly,'expense') }

  const tipStyle = { backgroundColor:'var(--surface)', borderColor:'var(--border)', borderRadius:12, color:'var(--primary)', fontSize:12 }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Analysen</h1>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 20px 20px', display:'flex', gap:8 }}>
        {([['cashflow','Cashflow'],['vergleich','Vergleich'],['kategorien','Kategorien']] as const).map(([v,l]) => (
          <button key={v} onClick={()=>setTab(v)}
            style={{ padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:'none',
                     background: tab===v?'var(--accent)':'var(--surface)',
                     color: tab===v?'white':'var(--secondary)',
                     boxShadow: tab===v?'0 4px 12px rgba(229,72,63,.25)':'var(--shadow-sm)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Cashflow */}
      {tab==='cashflow' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Ø Einnahmen', val:fmt(cashflow.filter(m=>m.income>0).reduce((s,m)=>s+m.income,0)/Math.max(cashflow.filter(m=>m.income>0).length,1)), color:'var(--success)' },
              { label:'Ø Ausgaben',  val:fmt(cashflow.filter(m=>m.expenses>0).reduce((s,m)=>s+m.expenses,0)/Math.max(cashflow.filter(m=>m.expenses>0).length,1)), color:'var(--accent)' },
              { label:'Ø Netto',     val:fmt(cashflow.filter(m=>m.income>0).reduce((s,m)=>s+m.netto,0)/Math.max(cashflow.filter(m=>m.income>0).length,1)), color:'var(--primary)' },
            ].map(k=>(
              <div key={k.label} className="app-card" style={{ padding:'14px 12px', textAlign:'center' }}>
                <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:4 }}>{k.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:k.color }}>{k.val}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Cashflow</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Letzte 12 Monate</p>
            <div style={{ height:200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflow} margin={{top:0,right:0,left:-24,bottom:0}} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{fill:'var(--tertiary)',fontSize:9}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'var(--tertiary)',fontSize:9}} axisLine={false} tickLine={false}
                    tickFormatter={v=>(v as number)>=1000?`${((v as number)/1000).toFixed(0)}k`:`${v}`}/>
                  <Tooltip contentStyle={tipStyle} formatter={(v:unknown)=>[fmt(v as number),'']} cursor={{fill:'rgba(15,23,42,0.03)'}}/>
                  <Bar dataKey="income"   name="Einnahmen" fill="#22C55E" radius={[6,6,0,0]} maxBarSize={20}/>
                  <Bar dataKey="expenses" name="Ausgaben"  fill="#E5483F" radius={[6,6,0,0]} maxBarSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', gap:16, marginTop:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:3, background:'#22C55E' }}/><span style={{ fontSize:12, color:'var(--tertiary)' }}>Einnahmen</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:3, background:'#E5483F' }}/><span style={{ fontSize:12, color:'var(--tertiary)' }}>Ausgaben</span></div>
            </div>
          </div>

          {/* Top Ausgaben */}
          <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px 8px' }}>
              <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)' }}>Top Ausgaben</p>
              <p style={{ fontSize:13, color:'var(--tertiary)' }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
            </div>
            {transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()&&t.type==='expense'}).sort((a,b)=>b.amount-a.amount).slice(0,5).map((tx,i,arr)=>(
              <div key={tx.id} style={{ display:'flex', alignItems:'center', padding:'12px 20px', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                <span style={{ fontSize:15, fontWeight:500, color:'var(--primary)', flex:1 }}>{tx.description}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'var(--accent)', marginRight:4 }}>{fmt(tx.amount)}</span>
                <span style={{ fontSize:13, color:'var(--tertiary)' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vergleich */}
      {tab==='vergleich' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:16 }}>
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Monatsvergleich</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:20 }}>{MONTHS[lm]} vs. {MONTHS[tm]}</p>
            {([
              { label:'Einnahmen', cur:comp.tI, prev:comp.lI, better: comp.tI>=comp.lI },
              { label:'Ausgaben',  cur:comp.tE, prev:comp.lE, better: comp.tE<=comp.lE },
              { label:'Netto',     cur:comp.tI-comp.tE, prev:comp.lI-comp.lE, better:(comp.tI-comp.tE)>=(comp.lI-comp.lE) },
            ]).map((row,i)=>{
              const diff = row.cur - row.prev
              const pct  = row.prev>0?`${diff>=0?'+':''}${((diff/row.prev)*100).toFixed(0)}%`:'—'
              return (
                <div key={row.label} style={{ marginBottom: i<2?20:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:14, color:'var(--secondary)' }}>{row.label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
                                     background: row.better?'rgba(34,197,94,0.1)':'rgba(229,72,63,0.1)',
                                     color: row.better?'var(--success)':'var(--danger)' }}>{pct}</span>
                      <span style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>{fmt(row.cur)}</span>
                    </div>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--bg)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:3, background: row.better?'var(--success)':'var(--accent)',
                                  width:`${Math.min(100,row.cur/Math.max(row.cur,row.prev,1)*100)}%` }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <p style={{ fontSize:11, color:'var(--tertiary)' }}>{MONTHS[tm]}: {fmt(row.cur)}</p>
                    <p style={{ fontSize:11, color:'var(--tertiary)' }}>{MONTHS[lm]}: {fmt(row.prev)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Kategorien */}
      {tab==='kategorien' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:16 }}>
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Nach Kategorie</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
            {cats.length===0 ? (
              <p style={{ fontSize:15, color:'var(--tertiary)', textAlign:'center', padding:'20px 0' }}>Keine Ausgaben</p>
            ) : (
              <>
                <div style={{ height:180, marginBottom:16 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={cats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="total" nameKey="category">
                        {cats.map((_,i)=><Cell key={i} fill={PIE_COLS[i%PIE_COLS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={tipStyle} formatter={(v:unknown)=>[fmt(v as number),'']}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {cats.map((c,i)=>{
                    const pct = catTotal>0?(c.total/catTotal)*100:0
                    return (
                      <div key={c.category}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background:PIE_COLS[i%PIE_COLS.length], flexShrink:0 }}/>
                          <span style={{ fontSize:14, color:'var(--primary)', flex:1 }}>{c.category}</span>
                          <span style={{ fontSize:12, color:'var(--tertiary)' }}>{pct.toFixed(0)}%</span>
                          <span style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{fmt(c.total)}</span>
                        </div>
                        <div style={{ height:4, borderRadius:2, background:'var(--bg)', overflow:'hidden', marginLeft:18 }}>
                          <div style={{ height:'100%', borderRadius:2, background:PIE_COLS[i%PIE_COLS.length], width:`${pct}%` }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ height:20 }}/>
    </div>
  )
}
