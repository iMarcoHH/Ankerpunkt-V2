import type { VercelRequest, VercelResponse } from '@vercel/node'

const CATEGORIES = ['Wohnen','Lebensmittel','Transport','Abos','Gesundheit','Freizeit','Kleidung','Bildung','Sonstiges']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { description } = req.body ?? {}
  if (!description) return res.status(400).json({ error: 'No description' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,
        messages: [{
          role: 'user',
          content: `Ordne diese Ausgabe einer Kategorie zu. Antworte NUR mit dem Kategorienamen, nichts anderes.\nKategorien: ${CATEGORIES.join(', ')}\nAusgabe: "${description}"\nKategorie:`
        }]
      })
    })

    const data = await response.json()
    const suggested = data.content?.[0]?.text?.trim()

    if (suggested && CATEGORIES.includes(suggested)) {
      res.json({ category: suggested })
    } else {
      res.json({ category: null })
    }
  } catch (e) {
    res.status(500).json({ error: 'AI error' })
  }
}
