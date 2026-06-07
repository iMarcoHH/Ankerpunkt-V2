import React from 'react'
import { ArrowRight, Shield, PieChart, Target, Smartphone } from 'lucide-react'

type LandingpageProps = {
  onStart?: () => void
}

export default function Landingpage({ onStart }: LandingpageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '80px 20px 60px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#0071e3',
              letterSpacing: '0.04em',
            }}
          >
            ⚓ ANKERPUNKT
          </div>
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: 1.2,
            color: '#000000',
          }}
        >
          Deine Finanzen im sicheren Hafen.
        </h1>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0071e3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontWeight: '600',
            fontSize: '1.25rem',
            cursor: 'pointer',
            userSelect: 'none',
            boxShadow: '0 4px 14px rgba(0, 113, 227, 0.39)',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => onStart?.()}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0071e3')}
        >
          Kostenlos starten <ArrowRight size={24} />
        </button>
      </section>

      {/* Feature Section */}
      <section
        style={{
          maxWidth: '960px',
          width: '100%',
          padding: '0 20px 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            padding: '32px',
            backgroundColor: '#f5f7fa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <PieChart size={40} color="#0071e3" />
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontWeight: '700', fontSize: '1.25rem', color: '#000000' }}>
            Analysen
          </h3>
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: 1.4 }}>
            Cashflow, Kategorien und Trends auf einen Blick
          </p>
        </div>
        <div
          style={{
            borderRadius: '16px',
            padding: '32px',
            backgroundColor: '#f5f7fa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Target size={40} color="#0071e3" />
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontWeight: '700', fontSize: '1.25rem', color: '#000000' }}>
            Sparziele
          </h3>
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: 1.4 }}>
            Verfolge deine finanziellen Ziele
          </p>
        </div>
        <div
          style={{
            borderRadius: '16px',
            padding: '32px',
            backgroundColor: '#f5f7fa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Shield size={40} color="#0071e3" />
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontWeight: '700', fontSize: '1.25rem', color: '#000000' }}>
            Finanz-Score
          </h3>
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: 1.4 }}>
            Bewerte deine finanzielle Gesundheit
          </p>
        </div>
        <div
          style={{
            borderRadius: '16px',
            padding: '32px',
            backgroundColor: '#f5f7fa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Smartphone size={40} color="#0071e3" />
          <h3 style={{ marginTop: '20px', marginBottom: '12px', fontWeight: '700', fontSize: '1.25rem', color: '#000000' }}>
            Als App nutzbar
          </h3>
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: 1.4 }}>
            Direkt auf dem Homescreen installierbar
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '0 20px 60px',
          textAlign: 'left',
        }}
      >
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#000000',
            textAlign: 'center',
          }}
        >
          Warum Ankerpunkt?
        </h2>
        <div
          style={{
            backgroundColor: '#f5f7fa',
            color: '#000000',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <ul
            style={{
              listStyleType: 'none',
              paddingLeft: 0,
              fontSize: '1rem',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0071e3', fontWeight: '700' }}>✓</span> Keine Bankanbindung nötig
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0071e3', fontWeight: '700' }}>✓</span> Keine Werbung
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0071e3', fontWeight: '700' }}>✓</span> Keine monatlichen Gebühren
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0071e3', fontWeight: '700' }}>✓</span> Volle Kontrolle über deine Daten
            </li>
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
          id="landing-auth-info"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f5f7fa',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#000000',
            }}
          >
            Bereit loszulegen?
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: '#333333',
              marginBottom: '32px',
            }}
          >
            Starte noch heute mit deiner persönlichen Finanzzentrale.
          </p>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#0071e3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontWeight: '600',
              fontSize: '1.25rem',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: '0 4px 14px rgba(0, 113, 227, 0.39)',
              transition: 'background-color 0.3s ease',
            }}
            onClick={() => onStart?.()}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#005bb5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0071e3')}
          >
            Jetzt kostenlos nutzen
          </button>
        </div>
      </section>
    </div>
  )
}
