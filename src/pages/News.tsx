import { useState, useRef, useEffect } from 'react'

interface NewsItem {
  title:       string
  link:        string
  pubDate:     string
  description: string
  source:      string
}

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'Tagesschau':        { bg: 'rgba(59,130,246,0.15)',  text: '#60A5FA' },
  'Handelsblatt':      { bg: 'rgba(234,179,8,0.15)',   text: '#FBBF24' },
  'Finanzen.net':      { bg: 'rgba(16,185,129,0.15)',  text: '#34D399' },
  'Manager Magazin':   { bg: 'rgba(168,85,247,0.15)',  text: '#C084FC' },
  'Börse.de':          { bg: 'rgba(236,72,153,0.15)',  text: '#F472B6' },
  'Wallstreet Online': { bg: 'rgba(20,184,166,0.15)',  text: '#2DD4BF' },
  'Zeit Wirtschaft':   { bg: 'rgba(249,115,22,0.15)',  text: '#FB923C' },
}
const SOURCE_ACCENT: Record<string, string> = {
  'Tagesschau':        '#3B82F6',
  'Handelsblatt':      '#EAB308',
  'Finanzen.net':      '#10B981',
  'Manager Magazin':   '#A855F7',
  'Börse.de':          '#EC4899',
  'Wallstreet Online': '#14B8A6',
  'Zeit Wirtschaft':   '#F97316',
}

function formatRelative(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Gerade eben'
    if (mins < 60) return `vor ${mins} Min.`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `vor ${hours} Std.`
    return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  } catch { return '' }
}

function InAppBrowser({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [blocked, setBlocked] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const domain = (() => { try { return new URL(url).hostname.replace('www.','') } catch { return url } })()
  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: '#0D1B2A', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
           style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top,0px))', borderBottom: '1px solid rgba(61,81,102,0.4)' }}>
        <button onClick={onClose} className="p-1.5 rounded-full text-cement" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: '#162030' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          <span className="text-xs text-cement truncate">{domain}</span>
        </div>
        <button onClick={onClose} className="p-1.5 text-cement" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {blocked ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="text-4xl">📰</div>
          <p className="font-semibold text-white">Seite lässt sich nicht einbetten</p>
          <p className="text-sm text-cement">{domain} blockiert die Anzeige.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl font-semibold text-sm text-white" style={{ background: '#C8392B' }}>Im Browser öffnen</a>
          <button onClick={onClose} className="text-sm text-cement underline">Zurück</button>
        </div>
      ) : (
        <iframe ref={iframeRef} src={url} className="flex-1 w-full border-0" title={title}
          onLoad={() => { try { const d=iframeRef.current?.contentDocument; if(!d||d.body.innerHTML==='') setBlocked(true) } catch { setBlocked(true) } }}
          onError={() => setBlocked(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/>
      )}
    </div>
  )
}

function ArticleSheet({ item, onClose, onOpenBrowser }: { item: NewsItem; onClose: () => void; onOpenBrowser: (url:string,title:string)=>void }) {
  const accent = SOURCE_ACCENT[item.source] ?? '#C8392B'
  const colors = SOURCE_COLORS[item.source] ?? { bg: 'rgba(200,57,43,0.15)', text: '#C8392B' }
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}/>
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl"
           style={{ background: '#0D1B2A', maxHeight: '85dvh', paddingBottom: 'env(safe-area-inset-bottom,0px)', animation: 'sheetUp 0.35s cubic-bezier(0.32,0.72,0,1) forwards' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 rounded-full" style={{ background: '#3D5166' }}/></div>
        <div className="flex items-start justify-between px-5 pt-2 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(61,81,102,0.4)' }}>
          <div className="flex flex-col gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-mono tracking-wider w-fit" style={{ background: colors.bg, color: colors.text }}>{item.source}</span>
            {item.pubDate && <span className="font-mono text-[10px] text-cement">{formatRelative(item.pubDate)}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 text-cement"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="pl-4 py-1" style={{ borderLeft: `4px solid ${accent}` }}>
            <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>
          </div>
          {item.description ? (
            <div className="rounded-xl p-4" style={{ background: '#162030' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#C8D4E0' }}>{item.description}</p>
              <p className="text-xs text-cement mt-3 italic">Zusammenfassung — vollständigen Artikel beim Anbieter lesen.</p>
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center" style={{ background: '#162030' }}><div className="text-3xl mb-2">📰</div><p className="text-sm text-cement">Keine Vorschau.</p></div>
          )}
        </div>
        <div className="px-5 pb-5 pt-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(61,81,102,0.4)' }}>
          <button onClick={() => onOpenBrowser(item.link, item.title)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white"
            style={{ background: accent }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            Vollständigen Artikel lesen
          </button>
        </div>
      </div>
    </>
  )
}

export function NewsPage({ onBack }: { onBack?: () => void }) {
  const [news, setNews]         = useState<NewsItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [fetching, setFetching] = useState(false)
  const [search, setSearch]     = useState('')
  const [source, setSource]     = useState<string|null>(null)
  const [selected, setSelected] = useState<NewsItem|null>(null)
  const [browser, setBrowser]   = useState<{url:string;title:string}|null>(null)

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

  const sources  = Array.from(new Set(news.map(n => n.source)))
  const filtered = news.filter(n =>
    (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase())) &&
    (!source || n.source === source)
  )

  return (
    <>
      <div className="pb-24 min-h-screen" style={{ background: '#F4F2EE' }}>
        <div className="bg-navy px-5 pt-14 pb-5" style={{ borderBottom: '3px solid #C8392B' }}>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 mb-3" style={{ color: '#9AA0A6', WebkitTapHighlightColor: 'transparent' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              <span className="font-mono text-[10px] tracking-widest uppercase">Zurück</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// Live</div>
              <div className="font-display text-white text-4xl tracking-wide">NEWS</div>
            </div>
            <button onClick={load} disabled={fetching} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', WebkitTapHighlightColor: 'transparent' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
          <div className="relative mt-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="ak-input pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}/>
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">
          {sources.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[null, ...sources].map(s => (
                <button key={s??'alle'} onClick={() => setSource(s)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-all"
                  style={{ background: source===s ? '#0D1B2A' : 'white', color: source===s ? 'white' : '#9AA0A6', border: source===s ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
                  {s ?? 'Alle'}
                </button>
              ))}
            </div>
          )}

          {loading && Array.from({length:6}).map((_,i) => (
            <div key={i} className="ak-card p-4 space-y-2">
              <div className="flex gap-2"><div className="h-5 w-28 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }}/><div className="h-5 w-16 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}/></div>
              <div className="h-4 w-full rounded" style={{ background: 'rgba(0,0,0,0.08)' }}/>
              <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(0,0,0,0.05)' }}/>
            </div>
          ))}

          {error && !loading && (
            <div className="ak-card p-8 text-center">
              <div className="text-4xl mb-3">📡</div>
              <p className="font-sans text-sm font-semibold text-navy mb-1">Keine Verbindung</p>
              <p className="font-sans text-xs text-cement mb-4">Internetverbindung prüfen.</p>
              <button onClick={load} className="ak-btn ak-btn-navy px-6 py-2 text-sm">Erneut versuchen</button>
            </div>
          )}

          {!loading && !error && filtered.map((item, i) => {
            const colors = SOURCE_COLORS[item.source] ?? { bg: 'rgba(200,57,43,0.1)', text: '#C8392B' }
            return (
              <button key={i} onClick={() => setSelected(item)} className="ak-card p-4 w-full text-left block" style={{ WebkitTapHighlightColor: 'transparent' }}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono tracking-wider" style={{ background: colors.bg, color: colors.text }}>{item.source}</span>
                  <span className="font-mono text-[9px] text-cement flex-shrink-0">{formatRelative(item.pubDate)}</span>
                </div>
                <div className="font-sans text-sm font-semibold text-navy leading-snug mb-1">{item.title}</div>
                {item.description && <div className="font-sans text-xs text-cement font-light leading-relaxed line-clamp-2">{item.description}</div>}
                <div className="flex items-center gap-1 mt-2">
                  <span className="font-mono text-[9px] text-cement">Weiterlesen</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>
            )
          })}

          {!loading && !error && filtered.length === 0 && news.length > 0 && (
            <div className="ak-card p-8 text-center"><div className="text-3xl mb-2">🔍</div><p className="font-sans text-sm text-cement">Keine Nachrichten gefunden.</p></div>
          )}

          {!loading && !error && news.length > 0 && (
            <p className="font-mono text-[9px] text-cement text-center tracking-widest uppercase pb-2">
              {filtered.length} von {news.length} · Alle 10 Min. aktualisiert
            </p>
          )}
        </div>
      </div>

      {selected && !browser && <ArticleSheet item={selected} onClose={() => setSelected(null)} onOpenBrowser={(url,title) => { setBrowser({url,title}); setSelected(null) }}/>}
      {browser && <InAppBrowser url={browser.url} title={browser.title} onClose={() => setBrowser(null)}/>}
    </>
  )
}
