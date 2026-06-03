import { useState } from 'react'
import { useStore } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME, type TransactionType } from '../lib/supabase'

interface AddTransactionProps {
  onClose: () => void
}

export function AddTransaction({ onClose }: AddTransactionProps) {
  const { transactions, setTransactions, userId } = useStore()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount]      = useState('')
  const [desc, setDesc]          = useState('')
  const [category, setCategory]  = useState('')
  const [date, setDate]          = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving]      = useState(false)
  const [error, setError]        = useState('')

  const cats = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function handleSave() {
    if (!amount || !desc) { setError('Betrag und Beschreibung sind Pflichtfelder.'); return }
    if (!category) { setError('Bitte eine Kategorie wählen.'); return }
    setSaving(true)
    setError('')

    const tx = {
      user_id:     userId ?? 'demo',
      type,
      amount:      parseFloat(amount),
      description: desc,
      category,
      date,
    }

    if (userId) {
      const { data: row, error: err } = await supabase.from('transactions').insert(tx).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      setTransactions([...transactions, row])
    } else {
      // local demo mode
      const newTx = { ...tx, id: Date.now().toString(), created_at: new Date().toISOString() }
      setTransactions([...transactions, newTx])
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">

        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-navy/15"/>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="font-display text-navy text-2xl tracking-wide">EINTRAG</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-navy/6 flex items-center justify-center text-cement text-xl leading-none">×</button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }}
              className={`flex-1 py-3 rounded-lg font-display text-base tracking-wider transition-all ${
                type === t
                  ? t === 'expense' ? 'bg-red text-white' : 'bg-signal text-white'
                  : 'bg-offwhite text-cement'
              }`}>
              {t === 'expense' ? '↓ Ausgabe' : '↑ Einnahme'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-navy/30">€</div>
          <input
            className="ak-input pl-10 font-display text-3xl text-navy"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
        </div>

        {/* Description */}
        <input
          className="ak-input mb-3"
          placeholder="Beschreibung"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        {/* Date */}
        <input
          className="ak-input mb-4"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        {/* Categories */}
        <div className="mb-4">
          <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Kategorie</div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`cat-chip ${category === cat ? 'selected' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red/10 text-red font-mono text-[10px] tracking-wider px-3 py-2 rounded-lg mb-3">
            {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full ak-btn ak-btn-primary text-base">
          {saving ? 'Speichern...' : 'Eintragen'}
        </button>

      </div>
    </div>
  )
}
