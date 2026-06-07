import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Dock } from './components/Dock'
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
import { OnboardingPage }     from './pages/Onboarding'
import { AuthPage }           from './pages/Auth'
import Landingpage from './components/Landingpage'
import { supabase }           from './lib/supabase'
import type { Transaction }   from './lib/supabase'

try {
  ['ankerpunkt-store','ankerpunkt-store-v2','ankerpunkt-v2','ankerpunkt-v3','ankerpunkt-v4'].forEach(k => localStorage.removeItem(k))
} catch {}

export default function App() {
  const { activeTab, setTransactions, setInsurances, setGoals, setAchievements,
          setProfile, setUserId, setRecurring, setBudgets, setDebts, userId, recurring, theme } = useStore()
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

  // Realtime Subscriptions
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('ankerpunkt-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions',      filter: `user_id=eq.${userId}` },
        () => loadData(userId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals',    filter: `user_id=eq.${userId}` },
        () => supabase.from('savings_goals').select('*').eq('user_id', userId).then(({ data }) => { if (data) setGoals(data) }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts',            filter: `user_id=eq.${userId}` },
        () => supabase.from('debts').select('*').eq('user_id', userId).then(({ data }) => { if (data) setDebts(data) }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurances',       filter: `user_id=eq.${userId}` },
        () => supabase.from('insurances').select('*').eq('user_id', userId).then(({ data }) => { if (data) setInsurances(data) }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles',         filter: `id=eq.${userId}` },
        ({ new: p }) => { if (p) setProfile(p as any) })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Läuft einmal nach dem Laden — ON CONFLICT DO NOTHING verhindert Duplikate
  useEffect(() => {
    if (!userId || recurring.length === 0) return

    async function applyRecurring() {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear  = now.getFullYear()
      const today        = now.getDate()

      // Bereits existierende Transaktionen diesen Monat laden
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('description, amount, type, date')
        .eq('user_id', userId!)
        .gte('date', `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-01`)
        .lte('date', `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-31`)

      const existingSet = new Set(
        (existingTx ?? []).map(t => `${t.description}|${t.amount}|${t.type}`)
      )

      let newTxAdded = false

      for (const entry of recurring) {
        if (!entry.active) continue
        if (entry.day_of_month > today) continue

        // Prüfen ob bereits eine Transaktion mit gleicher description+amount+type diesen Monat existiert
        const key = `${entry.description}|${entry.amount}|${entry.type}`
        if (existingSet.has(key)) continue // Bereits vorhanden — überspringen

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const day = Math.min(entry.day_of_month, daysInMonth)
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`

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

        if (error && error.code !== '23505') {
          console.error('Recurring insert error:', error.message)
        } else if (!error) {
          newTxAdded = true
        }
      }

      // Nur neu laden wenn wirklich etwas hinzugefügt wurde
      if (newTxAdded) {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId!)
          .order('date', { ascending: false })
        if (data) setTransactions(data)
      }
    }

    applyRecurring()
  }, [userId]) // Nur einmal nach Login — NICHT bei recurring.length Änderung!

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
  if (!userId) return <Landingpage />

  return (
    <div>
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
      {activeTab === 'onboarding'    && <OnboardingPage />}
      {activeTab === 'profil'         && <ProfilPage />}
      <Dock />
    </div>
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
