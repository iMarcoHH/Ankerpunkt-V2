import { useState } from 'react'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { LogOut, Trash2, User, AlertTriangle } from 'lucide-react'

export function ProfilPage() {
  const { userId, profile, setUserId, setTransactions, setInsurances,
          setGoals, setAchievements, setProfile, setRecurring } = useStore()
  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null); setRecurring([])
  }

  async function handleReset() {
    if (!userId) return
    setResetting(true)
    try {
      // Alle Daten des Users löschen
      await Promise.all([
        supabase.from('transactions')     .delete().eq('user_id', userId),
        supabase.from('insurances')       .delete().eq('user_id', userId),
        supabase.from('savings_goals')    .delete().eq('user_id', userId),
        supabase.from('achievements')     .delete().eq('user_id', userId),
        supabase.from('recurring_entries').delete().eq('user_id', userId),
        supabase.from('notes')            .delete().eq('user_id', userId),
      ])
      // Store leeren
      setTransactions([]); setInsurances([])
      setGoals([]); setAchievements([]); setRecurring([])
      setDone(true)
      setTimeout(() => { setDone(false); setShowReset(false) }, 2000)
    } catch (e) { console.error(e) }
    setResetting(false)
  }

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Profil</h1>
        <p className="text-cement text-sm mt-0.5">Einstellungen & Account</p>
      </div>

      {/* User info */}
      <div className="ak-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
             style={{ background:'rgba(200,57,43,0.15)' }}>
          <User className="w-7 h-7" style={{ color:'#C8392B' }}/>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">
            {profile?.username ?? 'Anonym'}
          </p>
          <p className="text-xs text-cement mt-0.5 truncate">
            {profile?.email ?? ''}
          </p>
          {profile && (
            <p className="text-xs text-cement mt-0.5">
              Level {profile.level} · {profile.xp} XP
            </p>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <div className="space-y-2">
        {/* Logout */}
        <button onClick={handleLogout}
          className="ak-card w-full p-4 flex items-center gap-4 text-left"
          style={{ WebkitTapHighlightColor:'transparent' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background:'rgba(61,81,102,0.3)' }}>
            <LogOut className="w-5 h-5 text-cement"/>
          </div>
          <div>
            <p className="font-medium text-white text-sm">Ausloggen</p>
            <p className="text-xs text-cement mt-0.5">Account abmelden</p>
          </div>
        </button>

        {/* Reset */}
        <button onClick={() => setShowReset(true)}
          className="ak-card w-full p-4 flex items-center gap-4 text-left"
          style={{ border:'1px solid rgba(200,57,43,0.3)', WebkitTapHighlightColor:'transparent' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background:'rgba(200,57,43,0.15)' }}>
            <Trash2 className="w-5 h-5" style={{ color:'#C8392B' }}/>
          </div>
          <div>
            <p className="font-medium text-white text-sm">Alle Daten löschen</p>
            <p className="text-xs text-cement mt-0.5">Buchungen, Ziele, Versicherungen — alles zurücksetzen</p>
          </div>
        </button>
      </div>

      {/* Reset Confirm Dialog */}
      {showReset && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowReset(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
            {done ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-display text-white text-xl tracking-wide">ALLES GELÖSCHT</p>
                <p className="text-cement text-sm mt-2">Daten wurden zurückgesetzt.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background:'rgba(200,57,43,0.15)' }}>
                    <AlertTriangle className="w-5 h-5" style={{ color:'#C8392B' }}/>
                  </div>
                  <span className="font-display text-white text-xl">ALLE DATEN LÖSCHEN</span>
                </div>
                <p className="text-cement text-sm mb-6 leading-relaxed">
                  Das löscht unwiderruflich alle Buchungen, Versicherungen, Ziele, Notizen und Erfolge.
                  Der Account bleibt bestehen.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowReset(false)}
                    className="flex-1 ak-btn ak-btn-secondary">
                    Abbrechen
                  </button>
                  <button onClick={handleReset} disabled={resetting}
                    className="flex-1 ak-btn ak-btn-primary disabled:opacity-50">
                    {resetting ? 'Lösche...' : 'Alles löschen'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
