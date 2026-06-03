import { useMemo } from 'react'
import { useStore } from '../store'
import { AnchorLogo } from '../components/AnchorLogo'
import { supabase } from '../lib/supabase'

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function LageberichtPage() {
  const { transactions, insurances, goals, profile, achievements, setUserId, setTransactions, setInsurances, setGoals, setAchievements, setProfile } = useStore()

  const now   = new Date()
  const month = now.getMonth()
  const year  = now.getFullYear()

  const thisMonth = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    }), [transactions, month, year])

  const totalIncome  = useMemo(() => thisMonth.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0), [thisMonth])
  const totalExpense = useMemo(() => thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [thisMonth])
  const netto        = totalIncome - totalExpense

  const monthlyInsurance = useMemo(() =>
    insurances.reduce((s, i) => s + (i.period === 'monthly' ? i.amount : i.amount / 12), 0),
    [insurances]
  )

  const budgetPct  = totalIncome > 0 ? Math.min(100, Math.round(totalExpense / totalIncome * 100)) : 0
  const xp         = profile?.xp ?? 0
  const level      = profile?.level ?? 1
  const xpNext     = level * 100
  const xpPct      = Math.min(100, Math.round(xp / xpNext * 100))
  const unlockedCount = achievements.length
  const monthName  = now.toLocaleString('de-DE', { month: 'long' })
  const showDemo   = transactions.length === 0

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [transactions]
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null)
    setTransactions([])
    setInsurances([])
    setGoals([])
    setAchievements([])
    setProfile(null)
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-8 relative overflow-hidden" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}/>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <AnchorLogo size={28} />
            <div>
              <div className="font-display text-white tracking-widest text-lg leading-none">ANKERPUNKT</div>
              <div className="font-mono text-[9px] text-cement tracking-widest uppercase mt-0.5">// Dein Finanz-Überblick</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-signal" style={{ animation: 'pulseDot 2s ease-in-out infinite' }}/>
              <span className="font-mono text-[9px] text-white/60 tracking-widest">LVL {level}</span>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Ausloggen"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(200,57,43,0.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8392B" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// Ahoi {profile?.username ?? 'Kapitän'}</div>
          <div className="font-display text-white text-4xl tracking-wide leading-none">LAGEBERICHT</div>
          <div className="font-sans text-white/30 text-xs font-light mt-1">{monthName} {year} · Aktuell</div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 animate-in">
          {[
            { label: 'Einnahmen / Monat', value: showDemo ? '4.500' : fmt(totalIncome),       note: 'laufend',                                  border: '#E8A832' },
            { label: 'Ausgaben / Monat',  value: showDemo ? '818'   : fmt(totalExpense),       note: 'laufend',                                  border: '#C8392B' },
            { label: 'Netto',             value: showDemo ? '3.682' : fmt(Math.abs(netto)),    note: netto >= 0 ? 'Im Plus' : 'Im Minus',        border: '#0D1B2A' },
            { label: 'Versicherungen',    value: showDemo ? '9'     : fmt(monthlyInsurance),   note: `${insurances.length} aktiv`,               border: '#9AA0A6' },
          ].map((kpi, i) => (
            <div key={i} className="ak-card p-4" style={{ borderLeft: `3px solid ${kpi.border}` }}>
              <div className="font-mono text-[9px] tracking-widest uppercase mb-2 text-cement">{kpi.label}</div>
              <div className="font-display text-navy leading-none" style={{ fontSize: 28 }}>
                {kpi.value}<span className="text-base font-sans font-light text-cement ml-0.5">€</span>
              </div>
              <div className="font-mono text-[9px] mt-1 text-cement">{kpi.note}</div>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div className="ak-card p-4 animate-in-2">
          <div className="flex justify-between items-center mb-2">
            <div className="font-mono text-[10px] tracking-widest uppercase text-cement">Budget-Auslastung</div>
            <div className="font-display text-navy text-xl">{showDemo ? 45 : budgetPct}<span className="text-sm font-sans text-cement">%</span></div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${showDemo ? 45 : budgetPct}%` }}/>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[9px] text-cement">0€</span>
            <span className="font-mono text-[9px] text-cement">{showDemo ? '4.500€' : `${fmt(totalIncome)}€`}</span>
          </div>
        </div>

        {/* XP / Level */}
        <div className="ak-card bg-navy p-4 animate-in-3" style={{ borderLeft: '3px solid #C8392B' }}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-red">Level {level} — XP</div>
              <div className="font-display text-white text-2xl mt-0.5">{xp} <span className="text-base text-white/30">/ {xpNext} XP</span></div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[9px] text-white/30 tracking-widest mb-1">Achievements</div>
              <div className="font-display text-white text-3xl">{unlockedCount}</div>
            </div>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="progress-fill" style={{ width: `${showDemo ? 5 : xpPct}%`, background: '#C8392B' }}/>
          </div>
        </div>

        {/* Letzte Einträge */}
        <div className="animate-in-4">
          <div className="font-mono text-[10px] tracking-widest uppercase text-cement mb-3 flex items-center gap-2">
            <span>Letzte Einträge</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }}/>
          </div>
          {showDemo ? (
            <div className="space-y-2">
              {[
                { desc: 'Gehalt Juni',   cat: 'Gehalt',    amount: 4500, type: 'income',  date: '01.06.' },
                { desc: 'Miete',         cat: 'Wohnen',    amount: -600, type: 'expense', date: '01.06.' },
                { desc: 'Fitnessstudio', cat: 'Abos',      amount: -85,  type: 'expense', date: '03.06.' },
                { desc: 'Fahrkarte',     cat: 'Transport', amount: -63,  type: 'expense', date: '04.06.' },
              ].map((tx, i) => (
                <TxRow key={i} desc={tx.desc} cat={tx.cat} amount={tx.amount} date={tx.date} isIncome={tx.type === 'income'} />
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <EmptyState msg="Noch keine Einträge. Tippe auf + um zu starten." />
          ) : (
            <div className="space-y-2">
              {recentTx.map(tx => (
                <TxRow
                  key={tx.id}
                  desc={tx.description}
                  cat={tx.category}
                  amount={tx.type === 'income' ? tx.amount : -tx.amount}
                  date={new Date(tx.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                  isIncome={tx.type === 'income'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sparziele */}
        {(goals.length > 0 || showDemo) && (
          <div className="animate-in-5">
            <div className="font-mono text-[10px] tracking-widest uppercase text-cement mb-3 flex items-center gap-2">
              <span>Sparziele</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }}/>
            </div>
            <div className="space-y-3">
              {showDemo ? (
                <GoalCard name="Urlaub Japan" current={0} target={1500} deadline="2026-09-01" color="#C8392B"/>
              ) : goals.slice(0, 3).map(g => (
                <GoalCard key={g.id} name={g.name} current={g.current} target={g.target} deadline={g.deadline} color={g.color}/>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function TxRow({ desc, cat, amount, date, isIncome }: { desc: string; cat: string; amount: number; date: string; isIncome: boolean }) {
  return (
    <div className="ak-card p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
             style={{ background: isIncome ? 'rgba(232,168,50,0.12)' : 'rgba(200,57,43,0.1)' }}>
          {isIncome ? '↑' : '↓'}
        </div>
        <div>
          <div className="font-sans text-sm font-medium text-navy">{desc}</div>
          <div className="font-mono text-[9px] text-cement uppercase tracking-wider">{cat} · {date}</div>
        </div>
      </div>
      <div className={`font-display text-lg ${isIncome ? 'text-signal' : 'text-red'}`}>
        {isIncome ? '+' : ''}{amount.toLocaleString('de-DE')}€
      </div>
    </div>
  )
}

function GoalCard({ name, current, target, deadline, color }: { name: string; current: number; target: number; deadline: string | null; color: string }) {
  const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0
  return (
    <div className="ak-card p-4" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-sans text-sm font-semibold text-navy">{name}</div>
          {deadline && <div className="font-mono text-[9px] text-cement mt-0.5">bis {new Date(deadline).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>}
        </div>
        <div className="font-display text-navy text-xl">{pct}<span className="text-sm text-cement">%</span></div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }}/>
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[9px] text-cement">{current.toLocaleString('de-DE')}€</span>
        <span className="font-mono text-[9px] text-cement">{target.toLocaleString('de-DE')}€</span>
      </div>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="ak-card p-8 flex flex-col items-center gap-3 text-center">
      <AnchorLogo size={32} whiteBody={false} />
      <p className="font-sans text-sm text-cement font-light">{msg}</p>
    </div>
  )
}
