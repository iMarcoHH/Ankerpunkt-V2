import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    if (!email || !password) { setError('Bitte E-Mail und Passwort eingeben.'); return }
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message === 'Invalid login credentials' ? 'E-Mail oder Passwort falsch.' : err.message)
    } else {
      if (!username) { setError('Bitte einen Nutzernamen eingeben.'); setLoading(false); return }
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })
      if (err) setError(err.message)
      else setSuccess('Konto erstellt! Bitte E-Mail bestätigen, dann einloggen.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D1B2A' }}>

      {/* Top decoration */}
      <div style={{ height: 4, background: '#C8392B' }}/>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-8">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="mb-6">
          <circle cx="26" cy="10" r="5" stroke="#C8392B" strokeWidth="2.5" fill="none"/>
          <circle cx="26" cy="10" r="2" fill="#C8392B"/>
          <line x1="26" y1="15" x2="26" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="12" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="12" cy="36" r="3" fill="#C8392B"/>
          <circle cx="40" cy="36" r="3" fill="#C8392B"/>
        </svg>
        <div className="font-display text-white text-4xl tracking-widest mb-2">ANKERPUNKT</div>
        <div className="font-mono text-[10px] tracking-widest uppercase text-white/30">
          Dein Finanz-Überblick
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-5">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">

          {/* Mode toggle */}
          <div className="flex gap-1 bg-offwhite rounded-lg p-1 mb-6">
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-2 rounded-md font-mono text-[10px] tracking-widest uppercase transition-all"
                style={{
                  background: mode === m ? '#0D1B2A' : 'transparent',
                  color: mode === m ? 'white' : '#9AA0A6',
                }}>
                {m === 'login' ? 'Einloggen' : 'Registrieren'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Nutzername</label>
                <input
                  className="ak-input"
                  placeholder="z.B. marco"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">E-Mail</label>
              <input
                className="ak-input"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Passwort</label>
              <input
                className="ak-input"
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div className="bg-red/10 text-red font-mono text-[10px] tracking-wider px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="font-mono text-[10px] tracking-wider px-3 py-2 rounded-lg"
                   style={{ background: 'rgba(232,168,50,0.1)', color: '#E8A832' }}>
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full ak-btn ak-btn-navy mt-2 disabled:opacity-50"
            >
              {loading ? 'Laden...' : mode === 'login' ? 'Einloggen' : 'Konto erstellen'}
            </button>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mt-8 pb-8">
          <p className="font-mono text-[9px] text-white/20 tracking-widest uppercase">
            Klar. Kurs halten. Hamburg.
          </p>
        </div>
      </div>
    </div>
  )
}
