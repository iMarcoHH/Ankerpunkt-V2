import { supabase, ACHIEVEMENT_DEFS } from './supabase'
import { useStore } from '../store'

// Zentrale Gamification-Logik — keine API-Kosten
export function useGamification() {
  const { userId, achievements, setAchievements, profile, setProfile } = useStore()

  // XP vergeben und Level berechnen
  async function addXP(amount: number) {
    if (!userId || !profile) return
    const currentXP  = (profile as any).xp    ?? 0
    const currentLvl = (profile as any).level  ?? 1
    const newXP      = currentXP + amount
    const newLevel   = Math.floor(newXP / 100) + 1

    await supabase.from('profiles')
      .update({ xp: newXP, level: newLevel })
      .eq('id', userId)

    setProfile({ ...profile, xp: newXP, level: newLevel } as any)
  }

  // Achievement freischalten
  async function unlock(key: string) {
    if (!userId) return
    if (achievements.some(a => a.key === key)) return // schon freigeschaltet

    const def = ACHIEVEMENT_DEFS.find(d => d.key === key)
    if (!def) return

    const { data: row } = await supabase.from('achievements')
      .insert({ user_id: userId, key, xp: def.xp, unlocked_at: new Date().toISOString() })
      .select().single()

    if (row) {
      setAchievements([...achievements, row])
      await addXP(def.xp)
    }
  }

  // Nach jeder Transaktion prüfen
  async function checkAfterTransaction(totalTransactions: number, balance: number) {
    if (totalTransactions === 1)  await unlock('first_entry')
    if (totalTransactions === 10) await unlock('ten_entries')
    if (totalTransactions === 50) await unlock('fifty_entries')
    if (totalTransactions === 100) await unlock('hundred_entries')
    if (balance > 0)              await unlock('positive_balance')
    if (balance > 1000)           await unlock('savings_1k')
    if (balance > 5000)           await unlock('savings_5k')
    await addXP(2) // 2 XP pro Buchung
  }

  // Nach Ziel-Erreichen
  async function checkAfterGoal(isFirstGoal: boolean, isCompleted: boolean) {
    if (isFirstGoal)  await unlock('first_goal')
    if (isCompleted)  await unlock('goal_reached')
  }

  // Nach Versicherung
  async function checkAfterInsurance(isFirst: boolean) {
    if (isFirst) await unlock('first_insurance')
    await addXP(5)
  }

  // Streak tracken — beim App-Start aufrufen
  async function checkStreak() {
    if (!userId || !profile) return
    const lastOpen  = localStorage.getItem(`streak_last_${userId}`)
    const streak    = parseInt(localStorage.getItem(`streak_count_${userId}`) ?? '0')
    const today     = new Date().toDateString()

    if (lastOpen === today) return // heute schon gezählt

    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = lastOpen === yesterday ? streak + 1 : 1

    localStorage.setItem(`streak_last_${userId}`, today)
    localStorage.setItem(`streak_count_${userId}`, String(newStreak))

    await addXP(1) // 1 XP pro Tag

    if (newStreak >= 7)  await unlock('week_streak')
    if (newStreak >= 30) await unlock('month_streak')
    if (newStreak >= 100) await unlock('century_streak')
  }

  return { unlock, addXP, checkAfterTransaction, checkAfterGoal, checkAfterInsurance, checkStreak }
}
