import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'
import { Eye, EyeOff } from 'lucide-react'

export function AuthPage() {
  const { setUserId } = useStore()
  const [mode,     setMode]     = useState<'login'|'register'>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')
  const [success,  setSuccess]  = useState('')

  async function handle() {
    if (!email || !password) { setErr('E-Mail und Passwort erforderlich.'); return }
    setLoading(true); setErr(''); setSuccess('')
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr(error.message)
      else if (data.user) setUserId(data.user.id)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setErr(error.message)
      else if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: '', level: 1, xp: 0 })
        setSuccess('Bestätigungsmail gesendet! Bitte E-Mail bestätigen, dann einloggen.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
    }}>

      {/* Logo + Headline */}
      <motion.div
        initial={{ opacity:0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5 }}
        style={{ marginBottom:40, textAlign:'center' }}
      >
        {/* App Icon */}
        <div style={{
          width: 88, height: 88,
          borderRadius: 28,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 12px 40px rgba(229,72,63,.3)',
        }}>
          <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="10" r="5" stroke="white" strokeWidth="2.5"/>
            <circle cx="26" cy="10" r="2" fill="white"/>
            <line x1="26" y1="15" x2="26" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="12" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="36" r="3" fill="white"/>
            <circle cx="40" cy="36" r="3" fill="white"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '-0.04em',
          marginBottom: 8,
        }}>
          Ankerpunkt
        </h1>
        <p style={{ fontSize: 16, color: 'var(--secondary)', fontWeight: 400 }}>
          Deine Finanzen im sicheren Hafen.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, delay:0.1 }}
        className="app-card"
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Mode Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'var(--bg)',
          borderRadius: 16,
          padding: 4,
          marginBottom: 28,
        }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m}
              onClick={() => { setMode(m); setErr(''); setSuccess('') }}
              style={{
                padding: '11px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: 'var(--font)',
                transition: 'all 0.2s',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--primary)' : 'var(--tertiary)',
                boxShadow: mode === m ? 'var(--shadow-md)' : 'none',
              }}>
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* E-Mail */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
              E-Mail
            </p>
            <input
              className="ak-input"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              autoComplete="email"
            />
          </div>

          {/* Passwort */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
              Passwort
            </p>
            <div style={{ position:'relative' }}>
              <input
                className="ak-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ paddingRight: 48 }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4 }}
              >
                {showPw
                  ? <EyeOff width={18} height={18} style={{ color:'var(--tertiary)' }}/>
                  : <Eye    width={18} height={18} style={{ color:'var(--tertiary)' }}/>
                }
              </button>
            </div>
          </div>

          {/* Fehler / Erfolg */}
          {err && (
            <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              style={{ fontSize:13, color:'var(--danger)', background:'rgba(239,68,68,0.08)', padding:'12px 14px', borderRadius:12, lineHeight:1.5 }}>
              {err}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              style={{ fontSize:13, color:'var(--success)', background:'rgba(34,197,94,0.08)', padding:'12px 14px', borderRadius:12, lineHeight:1.5 }}>
              {success}
            </motion.div>
          )}

          {/* Button */}
          <button
            onClick={handle}
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Bitte warten...' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:0.4 }}
        style={{ fontSize:12, color:'var(--tertiary)', marginTop:24, textAlign:'center', lineHeight:1.7 }}
      >
        🔒 Deine Daten sind sicher gespeichert.<br/>
        Keine Weitergabe an Dritte.
      </motion.p>
    </div>
  )
}
