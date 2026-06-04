import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, Insurance, SavingsGoal, Achievement, Profile } from '../lib/supabase'

export interface RecurringEntry {
  id:           string
  user_id:      string
  type:         'income' | 'expense'
  amount:       number
  description:  string
  category:     string
  day_of_month: number
  active:       boolean
  created_at:   string
}

interface AppState {
  userId:    string | null
  profile:   Profile | null
  setUserId:  (id: string | null) => void
  setProfile: (p: Profile | null) => void

  transactions: Transaction[]
  insurances:   Insurance[]
  goals:        SavingsGoal[]
  achievements: Achievement[]
  recurring:    RecurringEntry[]
  setTransactions: (t: Transaction[]) => void
  setInsurances:   (i: Insurance[]) => void
  setGoals:        (g: SavingsGoal[]) => void
  setAchievements: (a: Achievement[]) => void
  setRecurring:    (r: RecurringEntry[]) => void

  viewMonth:     number
  viewYear:      number
  goToPrevMonth: () => void
  goToNextMonth: () => void

  activeTab:    string
  setActiveTab: (t: string) => void
}

// Alle alten Store-Keys beim Start löschen
const OLD_KEYS = ['ankerpunkt-store', 'ankerpunkt-store-v2', 'ankerpunkt-v2']
OLD_KEYS.forEach(k => { try { localStorage.removeItem(k) } catch {} })

const CURRENT_STORE = 'ankerpunkt-v4'

const now = new Date()

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId:  null,
      profile: null,
      setUserId:  (userId)  => set({ userId }),
      setProfile: (profile) => set({ profile }),

      transactions: [],
      insurances:   [],
      goals:        [],
      achievements: [],
      recurring:    [],
      setTransactions: (t) => set({ transactions: t }),
      setInsurances:   (i) => set({ insurances: i }),
      setGoals:        (g) => set({ goals: g }),
      setAchievements: (a) => set({ achievements: a }),
      setRecurring:    (r) => set({ recurring: r }),

      viewMonth: now.getMonth(),
      viewYear:  now.getFullYear(),
      goToPrevMonth: () => {
        const { viewMonth, viewYear } = get()
        if (viewMonth === 0) set({ viewMonth: 11, viewYear: viewYear - 1 })
        else set({ viewMonth: viewMonth - 1 })
      },
      goToNextMonth: () => {
        const { viewMonth, viewYear } = get()
        const n = new Date()
        if (viewYear === n.getFullYear() && viewMonth === n.getMonth()) return
        if (viewMonth === 11) set({ viewMonth: 0, viewYear: viewYear + 1 })
        else set({ viewMonth: viewMonth + 1 })
      },

      activeTab:    'dashboard',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: CURRENT_STORE,
      // Nur userId speichern — activeTab NIEMALS persistieren
      partialize: (s) => ({ userId: s.userId }),
    }
  )
)
