import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { ACHIEVEMENT_DEFS } from '../lib/supabase'
import { LogOut, Trash2, AlertTriangle, Pencil, Check, X,
         User, MapPin, Briefcase, Calendar, Wallet, Trophy, Star, Lock, Flame } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)

export function ProfilPage() {
  const { userId, profile, achievements, setUserId, setTransactions, setInsurances,
          setGoals, setAchievements, setProfile, setRecurring } = useStore()

  const [tab, setTab]         = useState<'profil'|'erfolge'>('profil')
  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [done, setDone]           = useState(false)
  const [editField, setEditField] = useState<string|null>(null)
  const [saving, setSaving]       = useState(false)

  // Edit state
  const [vals, setVals] = useState({
    full_name:  (profile as any)?.full_name  ?? '',
    username:   (profile as any)?.username   ?? '',
    occupation: (profile as any)?.occupation ?? '',
    city:       (profile as any)?.city       ?? '',
    birth_year: (profile as any)?.birth_year ?? '',
    salary:     (profile as any)?.salary     ?? '',
    monthly_budget: (profile as any)?.monthly_budget ?? '',
  })

  async function saveField(field: string) {
    if (!userId) return
    setSaving(true)
    const value = field === 'birth_year' || field === 'salary' || field === 'monthly_budget'
      ? vals[field as keyof typeof vals] ? parseFloat(String(vals[field as keyof typeof vals])) : null
      : vals[field as keyof typeof vals] || null

    await supabase.from('profiles').update({ [field]: value }).eq('id', userId)
    setProfile({ ...profile, [field]: value } as any)
    setEditField(null)
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null); setRecurring([])
  }

  async function handleReset() {
    if (!userId) return
    setResetting(true)
    await Promise.all([
      supabase.from('transactions')     .delete().eq('user_id', userId),
      supabase.from('insurances')       .delete().eq('user_id', userId),
      supabase.from('savings_goals')    .delete().eq('user_id', userId),
      supabase.from('achievements')     .delete().eq('user_id', userId),
      supabase.from('recurring_entries').delete().eq('user_id', userId),
      supabase.from('notes')            .delete().eq('user_id', userId),
    ])
    setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setRecurring([])
    setDone(true)
    setTimeout(() => { setDone(false); setShowReset(false) }, 2000)
    setResetting(false)
  }

  const p = profile as any

  return (
    <div className="p-5 space-y-4 pb-8">
      <div className="pt-14 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Profil</h1>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-0.5 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(61,81,102,0.35)' }}>
        {(['profil','erfolge'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
            style={{ background:tab===t?'rgba(255,255,255,0.1)':'transparent', color:tab===t?'white':'#9AA0A6' }}>
            {t === 'profil' ? 'Profil' : 'Erfolge'}
          </button>
        ))}
      </div>

      {/* Profil Tab */}
      {tab === 'profil' && (<>
      {/* Avatar + Name Hero */}
      <div className="ak-card p-5 flex flex-col items-center gap-3">
        {/* Avatar Circle */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display"
             style={{ background:'linear-gradient(135deg, #C8392B, #a82e22)', color:'white' }}>
          {p?.full_name?.charAt(0)?.toUpperCase() || p?.username?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Name */}
        {editField === 'full_name' ? (
          <InlineEdit
            value={vals.full_name}
            onChange={v => setVals(x=>({...x, full_name:v}))}
            onSave={() => saveField('full_name')}
            onCancel={() => setEditField(null)}
            saving={saving}
            placeholder="Dein Name"
          />
        ) : (
          <button onClick={() => setEditField('full_name')}
            className="flex items-center gap-2 group">
            <span className="font-display text-2xl tracking-wide text-white">
              {p?.full_name || 'Name eingeben'}
            </span>
            <Pencil className="w-3.5 h-3.5 text-cement opacity-0 group-hover:opacity-100 transition-opacity"/>
          </button>
        )}

        {/* Username */}
        {editField === 'username' ? (
          <InlineEdit
            value={vals.username}
            onChange={v => setVals(x=>({...x, username:v}))}
            onSave={() => saveField('username')}
            onCancel={() => setEditField(null)}
            saving={saving}
            placeholder="@username"
          />
        ) : (
          <button onClick={() => setEditField('username')}
            className="flex items-center gap-1.5 group">
            <span className="text-sm text-cement">
              {p?.username ? `@${p.username}` : '@username'}
            </span>
            <Pencil className="w-3 h-3 text-cement opacity-0 group-hover:opacity-50 transition-opacity"/>
          </button>
        )}

        {/* Level Badge */}
        {p?.level && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
               style={{ background:'rgba(232,168,50,0.15)', border:'1px solid rgba(232,168,50,0.3)' }}>
            <Trophy className="w-3.5 h-3.5" style={{ color:'#E8A832' }}/>
            <span className="text-xs font-mono" style={{ color:'#E8A832' }}>
              Level {p.level} · {p.xp} XP
            </span>
          </div>
        )}
      </div>

      {/* Info Felder */}
      <div className="space-y-2">
        <p className="font-mono text-[9px] text-cement tracking-widest uppercase px-1">Angaben</p>

        <ProfileField
          icon={<Briefcase className="w-4 h-4"/>}
          label="Beruf"
          value={p?.occupation}
          placeholder="Beruf eingeben"
          editing={editField === 'occupation'}
          editVal={vals.occupation}
          onEdit={() => setEditField('occupation')}
          onChange={v => setVals(x=>({...x, occupation:v}))}
          onSave={() => saveField('occupation')}
          onCancel={() => setEditField(null)}
          saving={saving}
        />

        <ProfileField
          icon={<MapPin className="w-4 h-4"/>}
          label="Stadt"
          value={p?.city}
          placeholder="Stadt eingeben"
          editing={editField === 'city'}
          editVal={vals.city}
          onEdit={() => setEditField('city')}
          onChange={v => setVals(x=>({...x, city:v}))}
          onSave={() => saveField('city')}
          onCancel={() => setEditField(null)}
          saving={saving}
        />

        <ProfileField
          icon={<Calendar className="w-4 h-4"/>}
          label="Geburtsjahr"
          value={p?.birth_year ? String(p.birth_year) : null}
          placeholder="z.B. 1995"
          type="number"
          editing={editField === 'birth_year'}
          editVal={String(vals.birth_year)}
          onEdit={() => setEditField('birth_year')}
          onChange={v => setVals(x=>({...x, birth_year:v}))}
          onSave={() => saveField('birth_year')}
          onCancel={() => setEditField(null)}
          saving={saving}
        />
      </div>

      {/* Finanzen */}
      <div className="space-y-2">
        <p className="font-mono text-[9px] text-cement tracking-widest uppercase px-1">Finanzen</p>

        <ProfileField
          icon={<Wallet className="w-4 h-4"/>}
          label="Gehalt / Monat"
          value={p?.salary ? fmt(p.salary) : null}
          placeholder="Gehalt eingeben"
          type="number"
          editing={editField === 'salary'}
          editVal={String(vals.salary)}
          onEdit={() => setEditField('salary')}
          onChange={v => setVals(x=>({...x, salary:v}))}
          onSave={() => saveField('salary')}
          onCancel={() => setEditField(null)}
          saving={saving}
          accent="#E8A832"
        />

        <ProfileField
          icon={<Wallet className="w-4 h-4"/>}
          label="Monatsbudget"
          value={p?.monthly_budget ? fmt(p.monthly_budget) : null}
          placeholder="Budget eingeben"
          type="number"
          editing={editField === 'monthly_budget'}
          editVal={String(vals.monthly_budget)}
          onEdit={() => setEditField('monthly_budget')}
          onChange={v => setVals(x=>({...x, monthly_budget:v}))}
          onSave={() => saveField('monthly_budget')}
          onCancel={() => setEditField(null)}
          saving={saving}
          accent="#E8A832"
        />
      </div>

      {/* Account Aktionen */}
      <div className="space-y-2">
        <p className="font-mono text-[9px] text-cement tracking-widest uppercase px-1">Account</p>

        <button onClick={handleLogout}
          className="ak-card w-full p-4 flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ background:'rgba(61,81,102,0.3)' }}>
            <LogOut className="w-4 h-4 text-cement"/>
          </div>
          <div>
            <p className="font-medium text-white text-sm">Ausloggen</p>
            <p className="text-xs text-cement mt-0.5">Account abmelden</p>
          </div>
        </button>

        <button onClick={() => setShowReset(true)}
          className="ak-card w-full p-4 flex items-center gap-3 text-left"
          style={{ border:'1px solid rgba(200,57,43,0.3)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ background:'rgba(200,57,43,0.15)' }}>
            <Trash2 className="w-4 h-4" style={{ color:'#C8392B' }}/>
          </div>
          <div>
            <p className="font-medium text-white text-sm">Alle Daten löschen</p>
            <p className="text-xs text-cement mt-0.5">Buchungen, Ziele, Versicherungen zurücksetzen</p>
          </div>
        </button>
      </div>

      {/* Reset Dialog */}
      <AnimatePresence>
        {showReset && (
          <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowReset(false)}>
            <motion.div className="modal-sheet"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}>
              <div className="flex justify-center mb-3">
                <div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/>
              </div>
              {done ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-display text-white text-xl tracking-wide">ALLES GELÖSCHT</p>
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
                  <p className="text-cement text-sm mb-5 leading-relaxed">
                    Löscht alle Buchungen, Versicherungen, Ziele, Notizen und Erfolge. Der Account bleibt erhalten.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowReset(false)} className="flex-1 ak-btn ak-btn-secondary">Abbrechen</button>
                    <button onClick={handleReset} disabled={resetting} className="flex-1 ak-btn ak-btn-primary disabled:opacity-50">
                      {resetting ? 'Lösche...' : 'Alles löschen'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>)}

      {/* Erfolge Tab */}
      {tab === 'erfolge' && (
        <ErfolgeTab achievements={achievements} profile={p}/>
      )}
    </div>
  )
}

// ── Erfolge Tab ─────────────────────────────────────────────────────────────
function ErfolgeTab({ achievements, profile }: { achievements: any[]; profile: any }) {
  const xp       = profile?.xp    ?? 0
  const level    = profile?.level ?? 1
  const xpToNext = level * 100
  const xpPct    = Math.min(100, Math.round(xp / xpToNext * 100))
  const unlockedKeys = new Set(achievements.map((a:any) => a.key))

  return (
    <div className="space-y-4">
      {/* Level Card */}
      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{ background:'linear-gradient(135deg, #162030 0%, #1e2e40 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.2)' }}>
            <Trophy className="w-5 h-5" style={{ color:'#E8A832' }}/>
          </div>
          <div>
            <p className="text-xs text-cement uppercase tracking-widest">Level</p>
            <p className="text-2xl font-display tracking-wide text-white">Level {level}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-mono font-semibold" style={{ color:'#E8A832' }}>{xp} XP</p>
            <p className="text-xs text-cement">von {xpToNext} XP</p>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(61,81,102,0.4)' }}>
          <motion.div className="h-full rounded-full" style={{ background:'linear-gradient(90deg, #E8A832, #f0b84a)' }}
            initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1, ease:'easeOut' }}/>
        </div>
        <p className="text-xs text-cement mt-2">Noch {xpToNext - xp} XP bis Level {level + 1}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ak-card p-4 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.15)' }}>
            <Star className="w-5 h-5" style={{ color:'#E8A832' }}/>
          </div>
          <p className="text-3xl font-display text-white">{achievements.length}</p>
          <p className="text-xs text-cement uppercase tracking-wider">Abzeichen</p>
        </div>
        <div className="ak-card p-4 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(200,57,43,0.15)' }}>
            <Flame className="w-5 h-5" style={{ color:'#C8392B' }}/>
          </div>
          <p className="text-3xl font-display text-white">0</p>
          <p className="text-xs text-cement uppercase tracking-wider">Tage Streak</p>
        </div>
      </div>

      {/* Badges */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENT_DEFS.map((def, i) => {
          const unlocked = unlockedKeys.has(def.key)
          return (
            <motion.div key={def.key} initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*0.05 }}
              className="ak-card p-4 flex flex-col items-center text-center gap-2"
              style={{ border: unlocked ? '1px solid rgba(232,168,50,0.3)' : undefined, opacity: unlocked ? 1 : 0.45 }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
                   style={{ background: unlocked ? 'rgba(232,168,50,0.15)' : 'rgba(61,81,102,0.3)' }}>
                {unlocked ? def.icon : <Lock className="w-4 h-4 text-cement"/>}
              </div>
              <p className="font-semibold text-xs text-white leading-snug">{def.label}</p>
              <p className="text-[9px] text-cement leading-snug">{def.desc}</p>
              {unlocked && (
                <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background:'rgba(232,168,50,0.15)', color:'#E8A832' }}>+{def.xp} XP</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
function InlineEdit({ value, onChange, onSave, onCancel, saving, placeholder, type='text' }:
  { value:string; onChange:(v:string)=>void; onSave:()=>void; onCancel:()=>void; saving:boolean; placeholder:string; type?:string }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <input className="ak-input text-sm flex-1" type={type} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key==='Enter') onSave(); if (e.key==='Escape') onCancel() }}/>
      <button onClick={onSave} disabled={saving}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background:'#C8392B' }}>
        <Check className="w-4 h-4 text-white"/>
      </button>
      <button onClick={onCancel}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background:'rgba(255,255,255,0.08)' }}>
        <X className="w-4 h-4 text-cement"/>
      </button>
    </div>
  )
}

// ── Profile Field Row ─────────────────────────────────────────────────────────
function ProfileField({ icon, label, value, placeholder, type='text', editing, editVal,
  onEdit, onChange, onSave, onCancel, saving, accent }: {
  icon: React.ReactNode; label: string; value: string|null; placeholder: string
  type?: string; editing: boolean; editVal: string
  onEdit:()=>void; onChange:(v:string)=>void; onSave:()=>void; onCancel:()=>void
  saving: boolean; accent?: string
}) {
  return (
    <div className="ak-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: accent ? `${accent}22` : 'rgba(61,81,102,0.3)',
                    color: accent ?? '#9AA0A6' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-cement uppercase tracking-wider">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input className="ak-input text-sm py-1.5 px-2 flex-1" type={type}
              placeholder={placeholder} value={editVal}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') onSave(); if (e.key==='Escape') onCancel() }}
              autoFocus/>
            <button onClick={onSave} disabled={saving}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:'#C8392B' }}>
              <Check className="w-3.5 h-3.5 text-white"/>
            </button>
            <button onClick={onCancel}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:'rgba(255,255,255,0.08)' }}>
              <X className="w-3.5 h-3.5 text-cement"/>
            </button>
          </div>
        ) : (
          <button onClick={onEdit} className="flex items-center gap-1.5 group mt-0.5">
            <span className="text-sm" style={{ color: value ? 'white' : '#9AA0A6' }}>
              {value || placeholder}
            </span>
            <Pencil className="w-3 h-3 text-cement opacity-0 group-hover:opacity-60 transition-opacity"/>
          </button>
        )}
      </div>
    </div>
  )
}
