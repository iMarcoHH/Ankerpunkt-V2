import React from 'react'
import { ArrowRight, Smartphone, Hand, MonitorSmartphone } from 'lucide-react'

export function OnboardingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 20px 120px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--tertiary)', marginBottom: 8 }}>
            Schritt 1 von 8
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Hand size={28} color='var(--accent)' />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', margin:0 }}>
              Willkommen
            </h1>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 24,
            padding: 24,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 20
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(229,72,63,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}
          >
            <Smartphone size={36} color='var(--accent)' />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            App installieren
          </h2>

          <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            Installiere die App auf deinem Homescreen für die beste Nutzungserfahrung.
          </p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Smartphone size={18} />
              <p style={{ fontWeight:700, margin:0 }}>iPhone</p>
            </div>
            <p style={{ color: 'var(--secondary)' }}>
              1. Teilen-Symbol öffnen<br />
              2. „Zum Home-Bildschirm“ wählen<br />
              3. Hinzufügen antippen
            </p>
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <MonitorSmartphone size={18} />
              <p style={{ fontWeight:700, margin:0 }}>Android</p>
            </div>
            <p style={{ color: 'var(--secondary)' }}>
              1. Browser-Menü öffnen<br />
              2. „App installieren“ auswählen<br />
              3. Installation bestätigen
            </p>
          </div>
        </div>

        <button
          style={{
            width: '100%',
            height: 56,
            border: 'none',
            borderRadius: 16,
            background: 'var(--accent)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          Weiter
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}