import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Dock, SwipeContainer } from './components/Dock'
import { DashboardPage }      from './pages/Dashboard'
import { BuchungenPage }      from './pages/Buchungen'
import { AnalysenPage }       from './pages/Analysen'
import { ZielePage }          from './pages/Ziele'
import { VersicherungenPage } from './pages/Versicherungen'
import { GamificationPage }   from './pages/Gamification'
import { RechnerPage }        from './pages/Rechner'
import { NewsPage }           from './pages/News'
import { NotizenPage }        from './pages/Notizen'
import { LexikonPage }        from './pages/Lexikon'
import { ProfilPage }         from './pages/Profil'
import { AuthPage }           from './pages/Auth'
import { supabase }           from './lib/supabase'
import type { Transaction }   from './lib/supabase'

try {
  ['ankerpunkt-store','ankerpunkt-store-v2','ankerpunkt-v2','ankerpunkt-v3','ankerpunkt-v4'].forEach(k => localStorage.removeItem(k))
} catch {}

export default function App() {
  const { activeTab, setTransactions, setInsurances, setGoals, setAchievements,
          setProfile, setUserId, setRecurring, userId, transactions, recurring } = useStore()
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (!userId || recurring.length === 0) return
    const today = new Date()
    recurring.filter(r => r.active).forEach(async r => {
      const already = transactions.some(t =>
        t.description===r.description && t.amount===r.amount && t.type===r.type &&
        new Date(t.date).getMonth()===today.getMonth() && new Date(t.date).getFullYear()===today.getFullYear()
      )
      if (!already && today.getDate() >= r.day_of_month) {
        const date = new Date(today.getFullYear(), today.getMonth(), r.day_of_month).toISOString().split('T')[0]
        const { data: row } = await supabase.from('transactions')
          .insert({ user_id:userId, type:r.type, amount:r.amount, description:r.description, category:r.category, date })
          .select().single()
        if (row) setTransactions([row as Transaction, ...transactions])
      }
    })
  }, [userId, recurring])

  async function loadData(uid: string) {
    setLoading(true)
    try {
      const [txs,ins,goals,ach,profile,rec] = await Promise.allSettled([
        supabase.from('transactions').select('*').eq('user_id',uid).order('date',{ascending:false}),
        supabase.from('insurances').select('*').eq('user_id',uid),
        supabase.from('savings_goals').select('*').eq('user_id',uid),
        supabase.from('achievements').select('*').eq('user_id',uid),
        supabase.from('profiles').select('*').eq('id',uid).maybeSingle(),
        supabase.from('recurring_entries').select('*').eq('user_id',uid),
      ])
      if (txs.status==='fulfilled'     && txs.value.data)     setTransactions(txs.value.data)
      if (ins.status==='fulfilled'     && ins.value.data)     setInsurances(ins.value.data)
      if (goals.status==='fulfilled'   && goals.value.data)   setGoals(goals.value.data)
      if (ach.status==='fulfilled'     && ach.value.data)     setAchievements(ach.value.data)
      if (profile.status==='fulfilled' && profile.value.data) setProfile(profile.value.data)
      if (rec.status==='fulfilled'     && rec.value.data)     setRecurring(rec.value.data)
    } catch (e) { console.error(e) }
    setLoading(false)
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
      {activeTab === 'gamification'   && <GamificationPage />}
      {activeTab === 'rechner'        && <RechnerPage />}
      {activeTab === 'news'           && <NewsPage />}
      {activeTab === 'notizen'        && <NotizenPage />}
      {activeTab === 'lexikon'        && <LexikonPage />}
      {activeTab === 'profil'         && <ProfilPage />}
      <Dock />
    </SwipeContainer>
  )
}

function Splash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background:'#0D1B2A' }}>
      <svg width="56" height="56" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="10" r="5" stroke="#C8392B" strokeWidth="2.5" fill="none"/>
        <circle cx="26" cy="10" r="2" fill="#C8392B"/>
        <line x1="26" y1="15" x2="26" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="12" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="36" r="3" fill="#C8392B"/>
        <circle cx="40" cy="36" r="3" fill="#C8392B"/>
      </svg>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", color:'white', fontSize:24, letterSpacing:'0.2em' }}>ANKERPUNKT</div>
    </div>
  )
}
