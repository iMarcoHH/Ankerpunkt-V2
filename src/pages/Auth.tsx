import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AnchorLogo } from '../components/AnchorLogo'

export function AuthPage() {
  const [mode, setMode]       = useState<'login'|'signup'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [username, setUser]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    if (!email || !password) { setError('Bitte E-Mail und Passwort eingeben.'); return }
    setLoading(true); setError(''); setSuccess('')
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message === 'Invalid login credentials' ? 'E-Mail oder Passwort falsch.' : err.message)
    } else {
      if (!username) { setError('Bitte Nutzernamen eingeben.'); setLoading(false); return }
      const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
      if (err) setError(err.message)
      else setSuccess('Konto erstellt! Bitte E-Mail bestätigen.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D1B2A' }}>
      <div className="h-1" style={{ background: '#C8392B' }}/>

      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-8">
        <AnchorLogo size={52} className="mb-6"/>
        <div className="font-display text-white text-4xl tracking-widest mb-1">ANKERPUNKT</div>
        <div className="font-mono text-[10px] text-cement tracking-widest uppercase">Dein Finanz-Manager</div>
      </div>

      <div className="flex-1 px-5 max-w-sm mx-auto w-full">
        <div className="rounded-2xl p-6" style={{ background:'#162030', border:'1px solid rgba(61,81,102,0.5)' }}>

          {/* Mode toggle */}
          <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ background:'rgba(255,255,255,0.06)' }}>
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all"
                style={{ background: mode===m ? '#0D1B2A' : 'transparent',
                         color: mode===m ? 'white' : '#9AA0A6',
                         border: mode===m ? '1px solid rgba(61,81,102,0.6)' : 'none' }}>
                {m === 'login' ? 'Einloggen' : 'Registrieren'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Nutzername</label>
                <input className="ak-input" placeholder="z.B. marco"
                  value={username} onChange={e => setUser(e.target.value)}/>
              </div>
            )}
            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">E-Mail</label>
              <input className="ak-input" type="email" placeholder="deine@email.de"
                value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()}/>
            </div>
            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Passwort</label>
              <input className="ak-input" type="password" placeholder="Mindestens 6 Zeichen"
                value={password} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()}/>
            </div>

            {error   && <div className="font-mono text-[10px] px-3 py-2 rounded-lg" style={{ background:'rgba(200,57,43,0.15)', color:'#f87171' }}>{error}</div>}
            {success && <div className="font-mono text-[10px] px-3 py-2 rounded-lg" style={{ background:'rgba(232,168,50,0.15)', color:'#E8A832' }}>{success}</div>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full ak-btn ak-btn-primary mt-2 disabled:opacity-50">
              {loading ? 'Laden...' : mode==='login' ? 'Einloggen' : 'Konto erstellen'}
            </button>
          </div>
        </div>

        <div className="text-center mt-8 pb-8">
          <p className="font-mono text-[9px] text-cement/40 tracking-widest uppercase">Klar. Kurs halten. Hamburg.</p>
        </div>
      </div>
    </div>
  )
}
