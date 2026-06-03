import { useState, useEffect } from 'react'
import { useStore } from './store'
import { BottomNav } from './components/BottomNav'
import { AddTransaction } from './components/AddTransaction'
import { LageberichtPage }    from './pages/Lagebericht'
import { AnalysenPage }       from './pages/Analysen'
import { VersicherungenPage } from './pages/Versicherungen'
import { MehrPage }           from './pages/Mehr'
import { AuthPage }           from './pages/Auth'
import { supabase }           from './lib/supabase'

export default function App() {
  const { activeTab, setTransactions, setInsurances, setGoals, setAchievements, setProfile, setUserId, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUserId(session.user.id)
          loadData(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadData(session.user.id)
      } else {
        setUserId(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadData(uid: string) {
    setLoading(true)
    try {
      const [txsRes, insRes, goalsRes, achRes, profileRes] = await Promise.allSettled([
        supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
        supabase.from('insurances').select('*').eq('user_id', uid),
        supabase.from('savings_goals').select('*').eq('user_id', uid),
        supabase.from('achievements').select('*').eq('user_id', uid),
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      ])

      if (txsRes.status === 'fulfilled' && txsRes.value.data)       setTransactions(txsRes.value.data)
      if (insRes.status === 'fulfilled' && insRes.value.data)        setInsurances(insRes.value.data)
      if (goalsRes.status === 'fulfilled' && goalsRes.value.data)    setGoals(goalsRes.value.data)
      if (achRes.status === 'fulfilled' && achRes.value.data)        setAchievements(achRes.value.data)
      if (profileRes.status === 'fulfilled' && profileRes.value.data) setProfile(profileRes.value.data)
    } catch (e) {
      console.error('loadData error:', e)
    }
    setLoading(false)
  }

  if (loading) return <Splash/>
  if (!userId) return <AuthPage/>

  return (
    <div className="relative min-h-screen" style={{ background: '#F4F2EE' }}>
      <main style={{ paddingBottom: 'var(--nav-h)' }}>
        {activeTab === 'lagebericht'    && <LageberichtPage/>}
        {activeTab === 'analysen'       && <AnalysenPage/>}
        {activeTab === 'versicherungen' && <VersicherungenPage/>}
        {activeTab === 'mehr'           && <MehrPage/>}
      </main>

      <BottomNav onAddClick={() => setShowAdd(true)}/>

      {showAdd && <AddTransaction onClose={() => setShowAdd(false)}/>}
    </div>
  )
}

function Splash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4"
         style={{ background: '#0D1B2A' }}>
      <svg width="56" height="56" viewBox="0 0 52 52" fill="none"
           style={{ animation: 'pulse 2s ease-in-out infinite' }}>
        <circle cx="26" cy="10" r="5" stroke="#C8392B" strokeWidth="2.5" fill="none"/>
        <circle cx="26" cy="10" r="2" fill="#C8392B"/>
        <line x1="26" y1="15" x2="26" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="12" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="36" r="3" fill="#C8392B"/>
        <circle cx="40" cy="36" r="3" fill="#C8392B"/>
      </svg>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'white', fontSize: 24, letterSpacing: '0.2em' }}>
        ANKERPUNKT
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Laden...
      </div>
    </div>
  )
}
