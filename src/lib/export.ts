// CSV Export utility
export function exportTransactionsCSV(transactions: Array<{
  date: string; type: string; description: string; category: string; amount: number
}>) {
  const header = 'Datum;Typ;Beschreibung;Kategorie;Betrag (€)'
  const rows = transactions.map(t =>
    [
      new Date(t.date).toLocaleDateString('de-DE'),
      t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      `"${t.description.replace(/"/g,'""')}"`,
      t.category,
      t.amount.toFixed(2).replace('.',','),
    ].join(';')
  )
  const csv  = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ankerpunkt-export-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
