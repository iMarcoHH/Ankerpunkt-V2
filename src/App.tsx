import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Dock, SwipeContainer } from './components/Dock'
import { useGamification } from './lib/gamification'
import { DashboardPage }      from './pages/Dashboard'
import { BuchungenPage }      from './pages/Buchungen'
import { AnalysenPage }       from './pages/Analysen'
import { ZielePage }          from './pages/Ziele'
import { VersicherungenPage } from './pages/Versicherungen'
import { MehrPage }          from './pages/Mehr'
import { RechnerPage }        from './pages/Rechner'
import { NewsPage }           from './pages/News'
import { LexikonPage }        from './pages/Lexikon'
import { NotizenPage }        from './pages/Notizen'
import { SteuerPage }        from './pages/Steuern'
import { SchuldenPage }      from './pages/Schulden'
import { GamificationPage }  from './pages/Gamification'
import { ProfilPage }         from './pages/Profil'
import { AuthPage }           from './pages/Auth'
import { supabase }           from './lib/supabase'
import type { Transaction }   from './lib/supabase'

try {
  ['ankerpunkt-store','ankerpunkt-store-v2','ankerpunkt-v2','ankerpunkt-v3','ankerpunkt-v4'].forEach(k => localStorage.removeItem(k))
} catch {}

export default function App() {
  const { activeTab, setTransactions, setInsurances, setGoals, setAchievements,
          setProfile, setUserId, setRecurring, setBudgets, setDebts, userId, transactions, recurring, theme } = useStore()
  const { checkStreak } = useGamification()
  const [loading, setLoading] = useState(true)

  // Theme beim Start anwenden
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) { setUserId(session.user.id); loadData(session.user.id) }
        else setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUserId(session.user.id); loadData(session.user.id) }
      else { setUserId(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Wiederkehrende Buchungen sicher erzeugen
  // Läuft einmal nach dem Laden — ON CONFLICT DO NOTHING verhindert Duplikate
  useEffect(() => {
    if (!userId || recurring.length === 0) return

    async function applyRecurring() {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear  = now.getFullYear()
      const today        = now.getDate()

      for (const entry of recurring) {
        if (!entry.active) continue
        // Nur buchen wenn der Tag des Monats bereits erreicht ist
        if (entry.day_of_month > today) continue

        // Datum für diesen Monat
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const day = Math.min(entry.day_of_month, daysInMonth)
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`

        // ON CONFLICT DO NOTHING — DB Constraint verhindert Duplikate
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id:     userId,
            type:        entry.type,
            amount:      entry.amount,
            description: entry.description,
            category:    entry.category,
            date:        dateStr,
          })
          .select()
          .maybeSingle()

        if (error && error.code !== '23505') {
          // 23505 = unique_violation = Duplikat, das ist gewollt
          console.error('Recurring insert error:', error.message)
        }
      }

      // Transaktionen neu laden
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId!)
        .order('date', { ascending: false })
      if (data) setTransactions(data)
    }

    applyRecurring()
  }, [userId, recurring.length]) // Nur wenn userId oder Anzahl Recurring-Einträge sich ändert

  async function loadData(uid: string) {
    setLoading(true)
    try {
      const [txs,ins,goals,ach,profile,rec,bud] = await Promise.allSettled([
        supabase.from('transactions').select('*').eq('user_id',uid).order('date',{ascending:false}),
        supabase.from('insurances').select('*').eq('user_id',uid),
        supabase.from('savings_goals').select('*').eq('user_id',uid),
        supabase.from('achievements').select('*').eq('user_id',uid),
        supabase.from('profiles').select('*').eq('id',uid).maybeSingle(),
        supabase.from('recurring_entries').select('*').eq('user_id',uid),
        supabase.from('category_budgets').select('*').eq('user_id',uid),
        supabase.from('debts').select('*').eq('user_id',uid),
      ])
      if (txs.status==='fulfilled'     && txs.value.data)     setTransactions(txs.value.data)
      if (ins.status==='fulfilled'     && ins.value.data)     setInsurances(ins.value.data)
      if (goals.status==='fulfilled'   && goals.value.data)   setGoals(goals.value.data)
      if (ach.status==='fulfilled'     && ach.value.data)     setAchievements(ach.value.data)
      if (profile.status==='fulfilled' && profile.value.data) setProfile(profile.value.data)
      if (rec.status==='fulfilled'     && rec.value.data)     setRecurring(rec.value.data)
      if (bud.status==='fulfilled'     && bud.value.data)     setBudgets(bud.value.data)
      const dbt = await supabase.from('debts').select('*').eq('user_id',uid)
      if (dbt.data) setDebts(dbt.data)
    } catch (e) { console.error(e) }
    setLoading(false)
    checkStreak()
  }

  if (loading) return <Splash />
  if (!userId)  return <AuthPage />

  return (
    <SwipeContainer>
      {activeTab === 'dashboard'      && <DashboardPage />}
      {activeTab === 'buchungen'      && <BuchungenPage />}
      {activeTab === 'analysen'       && <AnalysenPage />}
      {activeTab === 'ziele'          && <ZielePage />}
      {activeTab === 'versicherungen' && <VersicherungenPage />}
      {activeTab === 'mehr'          && <MehrPage />}
      {activeTab === 'rechner'        && <RechnerPage />}
      {activeTab === 'news'           && <NewsPage />}
      {activeTab === 'lexikon'        && <LexikonPage />}
      {activeTab === 'notizen'        && <NotizenPage />}
      {activeTab === 'steuern'       && <SteuerPage />}
      {activeTab === 'schulden'      && <SchuldenPage />}
      {activeTab === 'gamification'  && <GamificationPage />}
      {activeTab === 'profil'         && <ProfilPage />}
      <Dock />
    </SwipeContainer>
  )
}

function Splash() {
  return (
    <div style={{ position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,background:'var(--bg)' }}>
      <img
        src="/favicon.png"
        alt="Ankerpunkt"
        style={{ width:100,height:100,borderRadius:28,boxShadow:'0 12px 40px rgba(229,72,63,.25)' }}
      />
      <div>
        <p style={{ fontSize:24,fontWeight:800,color:'var(--primary)',letterSpacing:'-0.03em',textAlign:'center' }}>Ankerpunkt</p>
        <p style={{ fontSize:14,color:'var(--tertiary)',textAlign:'center',marginTop:4 }}>Deine Finanzen im sicheren Hafen.</p>
      </div>
    </div>
  )
}
