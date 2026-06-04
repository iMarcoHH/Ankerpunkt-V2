import type { VercelRequest, VercelResponse } from '@vercel/node'

const FEEDS = [
  { url: 'https://www.tagesschau.de/xml/rss2_wirtschaft/', source: 'Tagesschau Wirtschaft' },
  { url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', source: 'Handelsblatt' },
  { url: 'https://www.finanzen.net/rss/news', source: 'Finanzen.net' },
]

interface NewsItem {
  title:       string
  link:        string
  pubDate:     string
  description: string
  source:      string
}

async function parseFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ankerpunkt/1.0)' },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return []
  const xml = await res.text()
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)         ?? [])[1]?.trim() ?? ''
    const link  = (block.match(/<link>([\s\S]*?)<\/link>/)                                       ?? [])[1]?.trim() ?? ''
    const date  = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)                                  ?? [])[1]?.trim() ?? ''
    const desc  = (block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) ?? [])[1]?.trim() ?? ''
    if (title) items.push({
      title:       title.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"'),
      link, pubDate: date,
      description: desc.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').slice(0, 300),
      source,
    })
  }
  return items.slice(0, 8)
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  try {
    const results = await Promise.allSettled(FEEDS.map(f => parseFeed(f.url, f.source)))
    const all: NewsItem[] = []
    results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value) })
    all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    res.json(all)
  } catch { res.status(500).json({ error: 'Feed error' }) }
}
