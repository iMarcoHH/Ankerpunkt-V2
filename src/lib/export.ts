import type { Transaction } from './supabase'

export function exportToCSV(transactions: Transaction[], filename = 'ankerpunkt-export.csv') {
  const headers = ['Datum','Typ','Beschreibung','Kategorie','Betrag (€)']
  const rows = transactions
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(t => [
      new Date(t.date).toLocaleDateString('de-DE'),
      t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      `"${t.description.replace(/"/g,'""')}"`,
      t.category,
      t.type === 'income' ? t.amount : -t.amount,
    ].join(';'))

  const csv = [headers.join(';'), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToJSON(data: object, filename = 'ankerpunkt-export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
