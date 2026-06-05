import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'

export function AuthPage() {
  const { setUserId } = useStore()
  const [mode,     setMode]     = useState<'login'|'register'>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')
  const [success,  setSuccess]  = useState('')

  async function handle() {
    if (!email||!password) { setErr('E-Mail und Passwort erforderlich.'); return }
    setLoading(true); setErr(''); setSuccess('')
    if (mode==='login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr(error.message)
      else if (data.user) setUserId(data.user.id)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setErr(error.message)
      else if (data.user) {
        await supabase.from('profiles').upsert({ id:data.user.id, full_name:'', level:1, xp:0 })
        setSuccess('Bestätigungsmail gesendet! Bitte E-Mail bestätigen.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom:40, textAlign:'center' }}>
        <div style={{ width:80,height:80,borderRadius:24,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 12px 32px rgba(229,72,63,.3)' }}>
          <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="10" r="5" stroke="white" strokeWidth="2.5"/>
            <circle cx="26" cy="10" r="2" fill="white"/>
            <line x1="26" y1="15" x2="26" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="12" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="36" r="3" fill="white"/>
            <circle cx="40" cy="36" r="3" fill="white"/>
          </svg>
        </div>
        <h1 style={{ fontSize:28,fontWeight:800,color:'var(--primary)',letterSpacing:'-0.03em',marginBottom:6 }}>Ankerpunkt</h1>
        <p style={{ fontSize:15,color:'var(--secondary)' }}>Deine Finanzen im sicheren Hafen.</p>
      </div>

      {/* Card */}
      <div className="app-card" style={{ width:'100%', maxWidth:400 }}>
        {/* Tab */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,background:'var(--bg)',borderRadius:14,padding:4,marginBottom:24 }}>
          {(['login','register'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr('');setSuccess('')}}
              style={{ padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:600,fontSize:14,
                       background:mode===m?'var(--surface)':'transparent',
                       color:mode===m?'var(--primary)':'var(--tertiary)',
                       boxShadow:mode===m?'var(--shadow-sm)':'none' }}>
              {m==='login'?'Anmelden':'Registrieren'}
            </button>
          ))}
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>E-Mail</p>
            <input className="ak-input" type="email" placeholder="deine@email.de" value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handle()}/>
          </div>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Passwort</p>
            <input className="ak-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handle()}/>
          </div>
          {err     && <p style={{ fontSize:13,color:'var(--danger)',background:'rgba(239,68,68,0.08)',padding:'10px 14px',borderRadius:12 }}>{err}</p>}
          {success && <p style={{ fontSize:13,color:'var(--success)',background:'rgba(34,197,94,0.08)',padding:'10px 14px',borderRadius:12 }}>{success}</p>}
          <button onClick={handle} disabled={loading} className="btn-primary" style={{ marginTop:4 }}>
            {loading?'Bitte warten...':(mode==='login'?'Anmelden':'Konto erstellen')}
          </button>
        </div>
      </div>

      <p style={{ fontSize:13,color:'var(--tertiary)',marginTop:24,textAlign:'center',lineHeight:1.6 }}>
        Deine Daten sind sicher gespeichert.{'\n'}Keine Weitergabe an Dritte.
      </p>
    </div>
  )
}
