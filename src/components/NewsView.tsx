import { useState, useEffect } from 'react'

interface NewsItem {
  title:       string
  source:      string
  pubDate:     string
  link:        string
  category:    string
}

const FEEDS = [
  { url: 'https://www.tagesschau.de/xml/rss2_wirtschaft/', source: 'Tagesschau', cat: 'Wirtschaft' },
  { url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', source: 'Handelsblatt', cat: 'Märkte' },
  { url: 'https://www.finanzen.net/rss/news', source: 'Finanzen.net', cat: 'Finanzen' },
]

const PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='

export function NewsView({ onBack }: { onBack: () => void }) {
  const [news, setNews]       = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    loadNews()
  }, [])

  async function loadNews() {
    setLoading(true)
    setError(false)
    const all: NewsItem[] = []

    await Promise.allSettled(
      FEEDS.map(async (feed) => {
        try {
          const res  = await fetch(`${PROXY}${encodeURIComponent(feed.url)}&count=5`)
          const data = await res.json()
          if (data.status === 'ok' && data.items) {
            data.items.slice(0, 5).forEach((item: { title: string; pubDate: string; link: string }) => {
              all.push({
                title:   item.title,
                source:  feed.source,
                pubDate: item.pubDate,
                link:    item.link,
                category: feed.cat,
              })
            })
          }
        } catch { /* skip failed feed */ }
      })
    )

    if (all.length > 0) {
      // Sort by date
      all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      setNews(all)
    } else {
      setError(true)
    }
    setLoading(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 60)  return `vor ${mins} Min.`
    if (hours < 24) return `vor ${hours} Std.`
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <button onClick={onBack} className="flex items-center gap-2 mb-3"
          style={{ color: '#9AA0A6', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="font-mono text-[10px] tracking-widest uppercase">Zurück</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-white text-4xl tracking-wide">LIVE-NEWS</div>
            <div className="font-sans text-white/30 text-xs mt-1">Wirtschaft & Märkte</div>
          </div>
          <button onClick={loadNews}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', WebkitTapHighlightColor: 'transparent' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="ak-card p-4">
                <div className="flex gap-2 mb-2">
                  <div className="h-3 w-20 rounded" style={{ background: 'rgba(0,0,0,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                  <div className="h-3 w-12 rounded" style={{ background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                </div>
                <div className="h-4 w-full rounded mb-1" style={{ background: 'rgba(0,0,0,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="ak-card p-6 text-center">
            <div className="text-3xl mb-2">📡</div>
            <p className="font-sans text-sm text-cement mb-3">Keine Verbindung zu den News-Feeds.</p>
            <button onClick={loadNews} className="ak-btn ak-btn-navy text-sm px-4 py-2">Erneut versuchen</button>
          </div>
        )}

        {!loading && !error && news.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
             className="ak-card p-4 block" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] tracking-widest uppercase text-red">{item.source}</span>
              <div className="w-1 h-1 rounded-full bg-cement"/>
              <span className="font-mono text-[9px] text-cement">{timeAgo(item.pubDate)}</span>
              <div className="ml-auto font-mono text-[8px] text-steel px-1.5 py-0.5 rounded"
                   style={{ background: '#F4F2EE' }}>{item.category}</div>
            </div>
            <div className="font-sans text-sm font-medium text-navy leading-snug">{item.title}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
