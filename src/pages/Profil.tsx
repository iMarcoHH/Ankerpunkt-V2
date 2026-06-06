import { useState, useRef } from 'react'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { LogOut, Trash2, AlertTriangle, ChevronRight, Moon, Sun, Wallet, Star, Flame, Camera, Briefcase, MapPin, Calendar } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)

export function ProfilPage() {
  const { userId, profile, achievements, setUserId, setTransactions, setInsurances,
          setGoals, setAchievements, setProfile, setRecurring, theme, setTheme } = useStore()
  const [tab,        setTab]        = useState<'profil'>('profil')
  const [showReset,  setShowReset]  = useState(false)
  const [resetting,  setResetting]  = useState(false)
  const [editField,  setEditField]  = useState<string|null>(null)
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [vals, setVals] = useState({
    full_name:      (profile as any)?.full_name      ?? '',
    username:       (profile as any)?.username       ?? '',
    occupation:     (profile as any)?.occupation     ?? '',
    city:           (profile as any)?.city           ?? '',
    birth_year:     (profile as any)?.birth_year     ?? '',
    salary:         (profile as any)?.salary         ?? '',
    monthly_budget: (profile as any)?.monthly_budget ?? '',
  })

  const p           = profile as any
  const xp          = p?.xp    ?? 0
  const level       = p?.level ?? 1
  const xpToNext    = level * 100
  const xpPct       = Math.min(100, Math.round(xp / xpToNext * 100))
  const streak      = userId ? parseInt(localStorage.getItem(`streak_count_${userId}`) ?? '0') : 0
  const unlockedKeys = new Set(achievements.map((a: any) => a.key))

  async function uploadAvatar(file: File) {
    if (!userId) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
      // Neues Objekt erzwingen damit React re-rendert
      setProfile({ ...(profile ?? {}), avatar_url: url } as any)
    } catch(e) { console.error(e) }
    setUploading(false)
  }

  async function saveField(field: string) {
    if (!userId) return
    setSaving(true)
    const value = ['birth_year','salary','monthly_budget'].includes(field)
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
    setTransactions([]); setInsurances([]); setGoals([]); setAchievements([]); setRecurring([])
    setResetting(false); setShowReset(false)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Profil</h1>
      </div>

      {/* Avatar Card */}
      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:28 }}>

          {/* Avatar mit Upload */}
          <div style={{ position:'relative' }}>
            <div style={{ width:88, height:88, borderRadius:'50%', overflow:'hidden', background:'var(--accent)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {p?.avatar_url
                ? <img src={p.avatar_url} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <span style={{ fontSize:32, fontWeight:800, color:'white' }}>
                    {p?.full_name?.charAt(0)?.toUpperCase() ?? p?.username?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
              }
            </div>
            {/* Upload Button */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%',
                       background:'var(--accent)', border:'2px solid var(--surface)', display:'flex',
                       alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              {uploading
                ? <div style={{ width:12, height:12, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
                : <Camera width={13} height={13} style={{ color:'white' }}/>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }}
              onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}/>
          </div>

          {/* Name editierbar */}
          {editField === 'full_name' ? (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input className="ak-input" style={{ height:40, textAlign:'center' }} value={vals.full_name}
                onChange={e => setVals(x => ({ ...x, full_name: e.target.value }))}
                onKeyDown={e => { if(e.key==='Enter') saveField('full_name'); if(e.key==='Escape') setEditField(null) }}/>
              <button onClick={() => saveField('full_name')} style={{ height:40, padding:'0 16px', borderRadius:12, background:'var(--accent)', border:'none', color:'white', fontWeight:600, cursor:'pointer' }}>✓</button>
              <button onClick={() => setEditField(null)} style={{ height:40, padding:'0 12px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--border)', color:'var(--secondary)', cursor:'pointer' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setEditField('full_name')} style={{ background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.02em' }}>
                {p?.full_name || 'Name eingeben'}
              </p>
              <p style={{ fontSize:14, color:'var(--tertiary)', marginTop:2 }}>
                {p?.username ? `@${p.username}` : p?.occupation || 'Beruf eingeben'}
              </p>
            </button>
          )}

          {/* Level Badge */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:20, background:'var(--bg)', border:'1px solid var(--border)' }}>
            <Star width={14} height={14} style={{ color:'var(--warning)' }}/>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--primary)' }}>Level {level}</span>
            <div style={{ width:60, height:4, borderRadius:2, background:'var(--border)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:2, background:'var(--warning)', width:`${xpPct}%` }}/>
            </div>
            <span style={{ fontSize:12, color:'var(--tertiary)' }}>{xp} XP</span>
          </div>
        </div>
      </div>



      {tab === 'profil' && (
        <>
          {/* Angaben */}
          <div style={{ padding:'0 20px 16px' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Angaben</p>
            <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
              {[
                { field:'occupation', label:'Beruf',       Icon:Briefcase, placeholder:'Beruf eingeben', type:'text' },
                { field:'city',       label:'Stadt',       Icon:MapPin,    placeholder:'Stadt eingeben', type:'text' },
                { field:'birth_year', label:'Geburtsjahr', Icon:Calendar,  placeholder:'z.B. 1995',      type:'number' },
              ].map(({ field, label, Icon, placeholder, type }, i, arr) => (
                <div key={field} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                                          borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon width={16} height={16} style={{ color:'var(--secondary)' }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, color:'var(--tertiary)', marginBottom:2 }}>{label}</p>
                    {editField === field ? (
                      <div style={{ display:'flex', gap:6 }}>
                        <input className="ak-input" style={{ height:36, flex:1 }} type={type}
                          value={String(vals[field as keyof typeof vals])}
                          onChange={e => setVals(x => ({ ...x, [field]: e.target.value }))}
                          onKeyDown={e => { if(e.key==='Enter') saveField(field); if(e.key==='Escape') setEditField(null) }}
                          autoFocus/>
                        <button onClick={() => saveField(field)} style={{ height:36, padding:'0 12px', borderRadius:10, background:'var(--accent)', border:'none', color:'white', fontWeight:600, cursor:'pointer' }}>✓</button>
                        <button onClick={() => setEditField(null)} style={{ height:36, padding:'0 10px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--border)', color:'var(--secondary)', cursor:'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditField(field)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left' }}>
                        <p style={{ fontSize:15, fontWeight:500, color: vals[field as keyof typeof vals] ? 'var(--primary)' : 'var(--tertiary)' }}>
                          {String(vals[field as keyof typeof vals]) || placeholder}
                        </p>
                      </button>
                    )}
                  </div>
                  <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)', flexShrink:0 }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Finanzen */}
          <div style={{ padding:'0 20px 16px' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Finanzen</p>
            <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
              {[
                { field:'salary',         label:'Gehalt / Monat', placeholder:'Gehalt eingeben' },
                { field:'monthly_budget', label:'Monatsbudget',   placeholder:'Budget eingeben' },
              ].map(({ field, label, placeholder }, i, arr) => (
                <div key={field} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                                          borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Wallet width={16} height={16} style={{ color:'var(--success)' }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, color:'var(--tertiary)', marginBottom:2 }}>{label}</p>
                    {editField === field ? (
                      <div style={{ display:'flex', gap:6 }}>
                        <input className="ak-input" style={{ height:36, flex:1 }} type="number" inputMode="decimal"
                          value={String(vals[field as keyof typeof vals])}
                          onChange={e => setVals(x => ({ ...x, [field]: e.target.value }))}
                          onKeyDown={e => { if(e.key==='Enter') saveField(field); if(e.key==='Escape') setEditField(null) }}
                          autoFocus/>
                        <button onClick={() => saveField(field)} style={{ height:36, padding:'0 12px', borderRadius:10, background:'var(--accent)', border:'none', color:'white', fontWeight:600, cursor:'pointer' }}>✓</button>
                        <button onClick={() => setEditField(null)} style={{ height:36, padding:'0 10px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--border)', color:'var(--secondary)', cursor:'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditField(field)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left' }}>
                        <p style={{ fontSize:15, fontWeight:500, color: vals[field as keyof typeof vals] ? 'var(--success)' : 'var(--tertiary)' }}>
                          {vals[field as keyof typeof vals] ? fmt(parseFloat(String(vals[field as keyof typeof vals]))) : placeholder}
                        </p>
                      </button>
                    )}
                  </div>
                  <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)', flexShrink:0 }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Einstellungen */}
          <div style={{ padding:'0 20px 16px' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Einstellungen</p>
            <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {theme === 'dark'
                    ? <Moon width={16} height={16} style={{ color:'var(--secondary)' }}/>
                    : <Sun  width={16} height={16} style={{ color:'var(--warning)' }}/>
                  }
                </div>
                <p style={{ fontSize:15, fontWeight:500, color:'var(--primary)', flex:1 }}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  style={{ width:48, height:28, borderRadius:14, border:'none', cursor:'pointer', position:'relative', transition:'background 0.3s',
                           background: theme === 'dark' ? 'var(--accent)' : 'rgba(15,23,42,0.12)' }}>
                  <div style={{ position:'absolute', top:3, width:22, height:22, borderRadius:11, background:'white',
                                transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                                left: theme === 'dark' ? 23 : 3 }}/>
                </button>
              </div>
              <button onClick={handleLogout}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                         background:'none', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <LogOut width={16} height={16} style={{ color:'var(--secondary)' }}/>
                </div>
                <p style={{ fontSize:15, fontWeight:500, color:'var(--primary)', flex:1, textAlign:'left' }}>Ausloggen</p>
                <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)' }}/>
              </button>
              <button onClick={() => setShowReset(true)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                         background:'none', border:'none', cursor:'pointer' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 width={16} height={16} style={{ color:'var(--danger)' }}/>
                </div>
                <p style={{ fontSize:15, fontWeight:500, color:'var(--danger)', flex:1, textAlign:'left' }}>Alle Daten löschen</p>
                <ChevronRight width={14} height={14} style={{ color:'var(--tertiary)' }}/>
              </button>
            </div>
          </div>
        </>
      )}



      {/* Reset Modal */}
      {showReset && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReset(false)}>
          <div className="modal-sheet">
            <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'0 auto 20px' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <AlertTriangle width={22} height={22} style={{ color:'var(--danger)' }}/>
              </div>
              <p style={{ fontSize:18, fontWeight:800, color:'var(--primary)' }}>Alle Daten löschen</p>
            </div>
            <p style={{ fontSize:15, color:'var(--secondary)', marginBottom:24, lineHeight:1.6 }}>
              Löscht alle Buchungen, Versicherungen, Ziele, Notizen und Erfolge. Der Account bleibt erhalten.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={() => setShowReset(false)} className="btn-secondary">Abbrechen</button>
              <button onClick={handleReset} disabled={resetting}
                style={{ height:54, borderRadius:18, border:'none', background:'var(--danger)', color:'white', fontWeight:600, fontSize:15, cursor:'pointer' }}>
                {resetting ? 'Lösche...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
