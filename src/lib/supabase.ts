import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dbamkjxxlfdcdisnytxh.supabase.co'
const SUPABASE_ANON_KEY = (import.meta as unknown as { env: Record<string,string> }).env?.VITE_SUPABASE_ANON_KEY || 'demo-placeholder-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type TransactionType = 'income' | 'expense'
export type InsurancePeriod = 'monthly' | 'yearly'

export interface Transaction {
  id:          string
  user_id:     string
  type:        TransactionType
  amount:      number
  description: string
  category:    string
  date:        string
  created_at:  string
}

export interface Insurance {
  id:          string
  user_id:     string
  name:        string
  provider:    string
  amount:      number
  period:      InsurancePeriod
  category:    string
  created_at:  string
}

export interface SavingsGoal {
  id:          string
  user_id:     string
  name:        string
  target:      number
  current:     number
  deadline:    string | null
  color?:      string        // optional — existiert nicht in allen DBs
  created_at:  string
}

export interface Achievement {
  id:          string
  user_id:     string
  key:         string
  unlocked_at: string
  xp:          number
}

export interface Profile {
  id:               string
  username?:        string
  full_name?:       string
  email?:           string
  avatar_url?:      string
  occupation?:      string
  city?:            string
  birth_year?:      number
  salary?:          number
  monthly_budget?:  number
  currency?:        string
  level?:           number
  xp?:              number
  created_at:       string
}

export const ACHIEVEMENT_DEFS = [
  { key: 'first_entry',       label: 'Erster Eintrag',     desc: 'Erste Transaktion erfasst',        xp: 10,  icon: '⚓' },
  { key: 'first_insurance',   label: 'Abgesichert',        desc: 'Erste Versicherung eingetragen',   xp: 15,  icon: '🛡' },
  { key: 'first_goal',        label: 'Kurs gesetzt',       desc: 'Erstes Sparziel definiert',        xp: 25,  icon: '🎯' },
  { key: 'ten_entries',       label: 'Buchhalter',         desc: '10 Transaktionen erfasst',         xp: 50,  icon: '📊' },
  { key: 'goal_reached',      label: 'Ziel erreicht',      desc: 'Ein Sparziel abgeschlossen',       xp: 100, icon: '🏆' },
  { key: 'week_streak',       label: '7 Tage aktiv',       desc: '7 Tage in Folge geöffnet',        xp: 75,  icon: '🔥' },
  { key: 'ai_first_chat',     label: 'KI Kontakt',         desc: 'Ersten Chat mit KI geführt',      xp: 20,  icon: '🤖' },
  { key: 'positive_balance',  label: 'Im Plus',            desc: 'Positives Monatssaldo erreicht',  xp: 30,  icon: '💚' },
]

export const CATEGORIES_EXPENSE = [
  'Wohnen', 'Lebensmittel', 'Transport', 'Abos', 'Gesundheit',
  'Freizeit', 'Kleidung', 'Bildung', 'Sonstiges',
]
export const CATEGORIES_INCOME = [
  'Gehalt', 'Freelance', 'Nebenjob', 'Kapitalerträge', 'Sonstiges',
]
export const INSURANCE_CATEGORIES = [
  'Haftpflicht', 'Hausrat', 'KFZ', 'Kranken', 'Leben', 'Rechtsschutz', 'Sonstiges',
]
