import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, Insurance, SavingsGoal, Achievement, Profile } from '../lib/supabase'

interface AppState {
  // Auth
  userId:       string | null
  profile:      Profile | null
  setUserId:    (id: string | null) => void
  setProfile:   (p: Profile | null) => void

  // Data
  transactions: Transaction[]
  insurances:   Insurance[]
  goals:        SavingsGoal[]
  achievements: Achievement[]
  setTransactions: (t: Transaction[]) => void
  setInsurances:   (i: Insurance[]) => void
  setGoals:        (g: SavingsGoal[]) => void
  setAchievements: (a: Achievement[]) => void

  // UI
  activeTab:    string
  setActiveTab: (t: string) => void
  theme:        'light' | 'dark'
  toggleTheme:  () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userId:  null,
      profile: null,
      setUserId:  (id)  => set({ userId: id }),
      setProfile: (p)   => set({ profile: p }),

      transactions: [],
      insurances:   [],
      goals:        [],
      achievements: [],
      setTransactions: (transactions) => set({ transactions }),
      setInsurances:   (insurances)   => set({ insurances }),
      setGoals:        (goals)        => set({ goals }),
      setAchievements: (achievements) => set({ achievements }),

      activeTab:   'lagebericht',
      setActiveTab: (activeTab) => set({ activeTab }),
      theme:        'light',
      toggleTheme:  () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'ankerpunkt-store', partialize: (s) => ({ userId: s.userId, theme: s.theme }) }
  )
)
