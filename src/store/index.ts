import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, Insurance, SavingsGoal, Achievement, Profile } from '../lib/supabase'

export interface RecurringEntry {
  id:          string
  user_id:     string
  type:        'income' | 'expense'
  amount:      number
  description: string
  category:    string
  day_of_month: number  // 1-31, Tag im Monat
  active:      boolean
  created_at:  string
}

interface AppState {
  // Auth
  userId:    string | null
  profile:   Profile | null
  setUserId:  (id: string | null) => void
  setProfile: (p: Profile | null) => void

  // Data
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

  // Monatsnavigation
  viewMonth: number  // 0-11
  viewYear:  number
  setViewMonth: (month: number, year: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void

  // UI
  activeTab:    string
  setActiveTab: (t: string) => void
}

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
      setTransactions: (transactions) => set({ transactions }),
      setInsurances:   (insurances)   => set({ insurances }),
      setGoals:        (goals)        => set({ goals }),
      setAchievements: (achievements) => set({ achievements }),
      setRecurring:    (recurring)    => set({ recurring }),

      viewMonth: now.getMonth(),
      viewYear:  now.getFullYear(),
      setViewMonth: (viewMonth, viewYear) => set({ viewMonth, viewYear }),
      goToPrevMonth: () => {
        const { viewMonth, viewYear } = get()
        if (viewMonth === 0) set({ viewMonth: 11, viewYear: viewYear - 1 })
        else set({ viewMonth: viewMonth - 1 })
      },
      goToNextMonth: () => {
        const { viewMonth, viewYear } = get()
        const now = new Date()
        // Nicht in die Zukunft navigieren
        if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return
        if (viewMonth === 11) set({ viewMonth: 0, viewYear: viewYear + 1 })
        else set({ viewMonth: viewMonth + 1 })
      },

      activeTab:    'lagebericht',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: 'ankerpunkt-store', partialize: (s) => ({ userId: s.userId }) }
  )
)
