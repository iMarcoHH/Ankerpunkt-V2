import { useState, useEffect } from 'react'
import { RefreshCw, X, ExternalLink } from 'lucide-react'

interface NewsItem { title:string; link:string; pubDate:string; description:string; source:string }

const SOURCE_COLOR: Record<string,string> = {
  'Tagesschau':'#3B82F6','Handelsblatt':'#F59E0B','Finanzen.net':'#22C55E',
  'Focus Online':'#EF4444','Stern':'#8B5CF6','Wallstreet Online':'#14B8A6','Zeit Wirtschaft':'#F97316',
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff/60000)
    if (m<1) return 'Gerade'
    if (m<60) return `vor ${m} Min.`
    const h = Math.floor(m/60)
    if (h<24) return `vor ${h} Std.`
    return new Date(dateStr).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})
  } catch { return '' }
}

export function NewsPage() {
  const [news,     setNews]    = useState<NewsItem[]>([])
  const [loading,  setLoading] = useState(true)
  const [fetching, setFetching]= useState(false)
  const [error,    setError]   = useState(false)
  const [source,   setSource]  = useState<string|null>(null)
  const [selected, setSelected]= useState<NewsItem|null>(null)
  const [browser,  setBrowser] = useState<{url:string;title:string}|null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setFetching(true); setError(false)
    try {
      const res = await fetch('/api/news')
      if (!res.ok) throw new Error()
      setNews(await res.json())
    } catch { setError(true) }
    setLoading(false); setFetching(false)
  }

  const sources  = Array.from(new Set(news.map(n=>n.source)))
  const filtered = news.filter(n=>!source||n.source===source)

  if (browser) {
    return (
      <div style={{ position:'fixed',inset:0,zIndex:200,background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'56px 20px 12px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
          <button onClick={()=>setBrowser(null)} style={{ width:36,height:36,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <X width={18} height={18} style={{ color:'var(--secondary)' }}/>
          </button>
          <div style={{ flex:1,background:'var(--bg)',borderRadius:10,padding:'6px 12px',overflow:'hidden' }}>
            <p style={{ fontSize:12,color:'var(--tertiary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {(() => { try { return new URL(browser.url).hostname } catch { return browser.url } })()}
            </p>
          </div>
          <a href={browser.url} target="_blank" rel="noopener noreferrer"
            style={{ width:36,height:36,borderRadius:10,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none' }}>
            <ExternalLink width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </a>
        </div>
        <iframe src={browser.url} style={{ flex:1,border:'none' }} title={browser.title}/>
      </div>
    )
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">News</h1>
        <button onClick={load} disabled={fetching}
          style={{ width:40,height:40,borderRadius:12,background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:4 }}>
          <RefreshCw width={16} height={16} style={{ color:'var(--secondary)',animation:fetching?'spin 1s linear infinite':undefined }}/>
        </button>
      </div>

      {/* Source Filter */}
      {sources.length > 0 && (
        <div style={{ padding:'0 20px 16px', display:'flex', gap:8, overflowX:'auto' }}>
          {[null,...sources].map(s=>(
            <button key={s??'alle'} onClick={()=>setSource(s)}
              style={{ padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',border:'none',whiteSpace:'nowrap',flexShrink:0,
                       background:source===s?'var(--accent)':'var(--surface)',
                       color:source===s?'white':'var(--secondary)',
                       boxShadow:source===s?'0 4px 12px rgba(229,72,63,.25)':'var(--shadow-sm)' }}>
              {s??'Alle'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading && Array.from({length:5}).map((_,i)=>(
          <div key={i} className="app-card" style={{ padding:20 }}>
            <div style={{ display:'flex',gap:8,marginBottom:10 }}>
              <div style={{ width:80,height:20,borderRadius:6,background:'var(--bg)' }}/>
              <div style={{ width:60,height:20,borderRadius:6,background:'var(--bg)' }}/>
            </div>
            <div style={{ width:'100%',height:16,borderRadius:4,background:'var(--bg)',marginBottom:6 }}/>
            <div style={{ width:'70%',height:16,borderRadius:4,background:'var(--bg)' }}/>
          </div>
        ))}

        {error && !loading && (
          <div className="app-card" style={{ textAlign:'center',padding:40 }}>
            <p style={{ fontSize:40,marginBottom:12 }}>📡</p>
            <p style={{ fontSize:16,fontWeight:600,color:'var(--primary)',marginBottom:8 }}>Keine Verbindung</p>
            <button onClick={load} className="btn-primary" style={{ width:'auto',padding:'0 24px',margin:'0 auto' }}>Erneut versuchen</button>
          </div>
        )}

        {!loading && !error && filtered.map((item,i)=>{
          const color = SOURCE_COLOR[item.source]??'var(--accent)'
          return (
            <button key={i} onClick={()=>setSelected(item)}
              className="app-card"
              style={{ width:'100%',textAlign:'left',border:'none',cursor:'pointer',display:'block',WebkitTapHighlightColor:'transparent' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,background:`${color}18`,color }}>
                  {item.source}
                </span>
                <span style={{ fontSize:11,color:'var(--tertiary)' }}>{timeAgo(item.pubDate)}</span>
              </div>
              <p style={{ fontSize:15,fontWeight:600,color:'var(--primary)',lineHeight:1.4,marginBottom:6 }}>{item.title}</p>
              {item.description && (
                <p style={{ fontSize:13,color:'var(--secondary)',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                  {item.description}
                </p>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ height:20 }}/>

      {/* Article Sheet */}
      {selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal-sheet" style={{ maxHeight:'85dvh' }}>
            <div style={{ width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 16px' }}/>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <span style={{ fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:20,
                             background:`${SOURCE_COLOR[selected.source]??'var(--accent)'}18`,
                             color:SOURCE_COLOR[selected.source]??'var(--accent)' }}>
                {selected.source}
              </span>
              <div style={{ display:'flex',gap:8 }}>
                <span style={{ fontSize:11,color:'var(--tertiary)' }}>{timeAgo(selected.pubDate)}</span>
                <button onClick={()=>setSelected(null)} style={{ width:28,height:28,borderRadius:8,background:'var(--bg)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
                  <X width={14} height={14} style={{ color:'var(--secondary)' }}/>
                </button>
              </div>
            </div>
            <div style={{ borderLeft:`3px solid ${SOURCE_COLOR[selected.source]??'var(--accent)'}`,paddingLeft:14,marginBottom:16 }}>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--primary)',lineHeight:1.4 }}>{selected.title}</p>
            </div>
            {selected.description && (
              <div className="app-card" style={{ marginBottom:16 }}>
                <p style={{ fontSize:15,color:'var(--secondary)',lineHeight:1.7 }}>{selected.description}</p>
                <p style={{ fontSize:12,color:'var(--tertiary)',marginTop:10,fontStyle:'italic' }}>Zusammenfassung — vollständigen Artikel beim Anbieter lesen.</p>
              </div>
            )}
            <button onClick={()=>{ setBrowser({url:selected.link,title:selected.title}); setSelected(null) }}
              className="btn-primary">
              Vollständigen Artikel lesen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
