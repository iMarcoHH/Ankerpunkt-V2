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
      justifyContent: 'flex-start',
      padding: '12px 24px 80px',
    }}>

      {/* Logo + Headline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: -40,
          textAlign: 'center',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <img
          src="/header.png"
          alt="Ankerpunkt"
          style={{
            width: '100%',
            maxWidth: 200,
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </motion.div>

      <div className="app-card" style={{ width: '100%', maxWidth: 400, margin: '0 auto', padding: '32px' }}>
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
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:0.4 }}
        style={{
          fontSize: 11,
          color: '#94A3B8',
          marginTop: 28,
          textAlign: 'center',
          lineHeight: 1.8,
        }}
      >
        Deine Daten sind sicher gespeichert.<br/>
        Keine Weitergabe an Dritte.
      </motion.p>
    </div>
  )
}
