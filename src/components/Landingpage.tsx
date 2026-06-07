import React from 'react'
import { ArrowRight, Shield, PieChart, Target, Smartphone } from 'lucide-react'

export default function Landingpage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'var(--fg)',
        fontFamily: 'inherit',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px 40px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        <img
          src="/logo.png"
          alt="Ankerpunkt"
          style={{ width: '220px', maxWidth: '80%', marginBottom: '24px' }}
        />
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}
        >
          Deine Finanzen im sicheren Hafen.
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--muted-fg)',
            marginBottom: '32px',
          }}
        >
          Verwalte Einnahmen, Ausgaben, Sparziele, Budgets und Schulden an einem Ort.
        </p>
        <button
          type="button"
          className="app-card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            userSelect: 'none',
            boxShadow: 'var(--shadow)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          Kostenlos starten <ArrowRight size={20} />
        </button>
      </section>

      {/* Feature Section */}
      <section
        style={{
          maxWidth: '960px',
          width: '100%',
          padding: '0 20px 40px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '32px',
            color: 'var(--fg)',
          }}
        >
          Alles was du brauchst
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="app-card" style={{ padding: '24px', textAlign: 'left' }}>
            <PieChart size={36} color="var(--accent)" />
            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontWeight: '600' }}>
              Analysen
            </h3>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.95rem' }}>
              Cashflow, Kategorien und Trends auf einen Blick
            </p>
          </div>
          <div className="app-card" style={{ padding: '24px', textAlign: 'left' }}>
            <Target size={36} color="var(--accent)" />
            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontWeight: '600' }}>
              Sparziele
            </h3>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.95rem' }}>
              Verfolge deine finanziellen Ziele
            </p>
          </div>
          <div className="app-card" style={{ padding: '24px', textAlign: 'left' }}>
            <Shield size={36} color="var(--accent)" />
            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontWeight: '600' }}>
              Finanz-Score
            </h3>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.95rem' }}>
              Bewerte deine finanzielle Gesundheit
            </p>
          </div>
          <div className="app-card" style={{ padding: '24px', textAlign: 'left' }}>
            <Smartphone size={36} color="var(--accent)" />
            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontWeight: '600' }}>
              Als App nutzbar
            </h3>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.95rem' }}>
              Direkt auf dem Homescreen installierbar
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '0 20px 40px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '24px',
            color: 'var(--fg)',
          }}
        >
          Warum Ankerpunkt?
        </h2>
        <div
          className="app-card"
          style={{
            backgroundColor: 'var(--bg-light)',
            color: 'var(--fg)',
            padding: '32px 24px',
            textAlign: 'left',
            boxShadow: 'var(--shadow)',
          }}
        >
          <ul
            style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            <li>Keine Bankanbindung nötig</li>
            <li>Keine Werbung</li>
            <li>Keine monatlichen Gebühren</li>
            <li>Volle Kontrolle über deine Daten</li>
          </ul>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '0 20px',
          marginBottom: '60px',
        }}
      >
        <div
          className="app-card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--fg)',
            }}
          >
            Bereit loszulegen?
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--muted-fg)',
              marginBottom: '32px',
            }}
          >
            Starte noch heute mit deiner persönlichen Finanzzentrale.
          </p>
          <button
            type="button"
            className="app-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: '6px',
              padding: '14px 32px',
              fontWeight: '600',
              fontSize: '1.125rem',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: 'var(--shadow)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            Jetzt kostenlos nutzen
          </button>
        </div>
      </section>
    </div>
  )
}
