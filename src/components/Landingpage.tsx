import React from 'react'
import { ArrowRight, Shield, PieChart, Target, Smartphone, ChevronRight } from 'lucide-react'

type LandingpageProps = {
  onStart?: () => void
}

export default function Landingpage({ onStart }: LandingpageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#1d1d1f',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
      }}
    >
      {/* Navigation Bar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#0F2238' }}>
          <span style={{ color: '#E5483F' }}>⚓</span> ANKERPUNKT
        </div>
        <button
          type="button"
          style={{
            backgroundColor: '#0F2238',
            color: '#ffffff',
            border: 'none',
            borderRadius: '980px',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onClick={() => onStart?.()}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          App öffnen
        </button>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '60px 20px 100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#f5f5f7',
              color: '#64748B',
              padding: '6px 14px',
              borderRadius: '980px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              letterSpacing: '0.02em',
            }}
          >
            DEINE FINANZEN IM SICHEREN HAFEN
          </div>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              lineHeight: '1.08',
              color: '#0F2238',
              marginBottom: '24px',
            }}
          >
            Das Dashboard für <br />
            <span style={{ color: '#E5483F' }}>dein Vermögen.</span>
          </h1>
          <p
            style={{
              fontSize: '1.4rem',
              lineHeight: '1.42',
              color: '#86868b',
              fontWeight: '400',
              marginBottom: '38px',
              maxWidth: '480px',
            }}
          >
            Verwalte Einnahmen, Ausgaben, Sparziele, Budgets und Schulden an einem Ort. Komplett privat, extrem übersichtlich.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0071e3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '980px',
                padding: '16px 32px',
                fontWeight: '500',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onClick={() => onStart?.()}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0077ed')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0071e3')}
            >
              Kostenlos starten <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Hero Image Showcase (Hier bettest du später deinen coolen App-Screenshot ein) */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '560px',
              backgroundColor: '#0F2238',
              borderRadius: '40px',
              boxShadow: '0 30px 60px rgba(15,34,56,0.25)',
              border: '12px solid #1d1d1f',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              position: 'relative'
            }}
          >
            {/* TIPP: Ersetze das folgende div einfach durch ein <img src="dein-screenshot.jpg" /> */}
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
              <p style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '6px' }}>[ Hier App-Screenshot einfügen ]</p>
              <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Nutze z.B. das Dashboard-Bild aus deinen Vorlagen</p>
            </div>
            
            {/* Subtile UI-Card Badge */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '-20px',
              backgroundColor: '#ffffff',
              color: '#0F2238',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{backgroundColor: '#22C55E', width: '12px', height: '12px', borderRadius: '50%'}}></div>
              <div style={{textAlign: 'left'}}>
                <div style={{fontSize: '0.75rem', color: '#86868b'}}>Gesamtvermögen</div>
                <div style={{fontWeight: '700', fontSize: '1rem'}}>+ 3.550 € im Plus</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento-Grid Feature Section */}
      <section style={{ backgroundColor: '#f5f5f7', padding: '100px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0F2238', marginBottom: '16px' }}>
              Alles was du brauchst. Und mehr.
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#86868b', maxWidth: '600px', margin: '0 auto' }}>
              Vergiss unübersichtliche Tabellen. Erlebe intelligentes Finanztracking im preisgekrönten Design.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              gridAutoRows: 'minmax(220px, auto)'
            }}
          >
            {/* Card 1: Große Doppel-Box */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#ffffff', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div>
                <PieChart size={32} color="#E5483F" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F2238', marginBottom: '8px' }}>Deep-Dive Analysen</h3>
                <p style={{ color: '#86868b', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.4 }}>
                  Cashflow, exakte Kategorie-Aufsplittungen und historische Trends intuitiv visualisiert.
                </p>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#0071e3', fontWeight: '500', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>Mehr erfahren <ChevronRight size={14} /></span>
            </div>

            {/* Card 2: Kleine Box */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div>
                <Target size={32} color="#0F2238" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F2238', marginBottom: '8px' }}>Smarte Sparziele</h3>
                <p style={{ color: '#86868b', fontSize: '1rem', lineHeight: 1.4 }}>
                  Erreiche Träume schneller mit automatischen Prognosen.
                </p>
              </div>
            </div>

            {/* Card 3: Kleine Box */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div>
                <Shield size={32} color="#22C55E" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F2238', marginBottom: '8px' }}>Finanz-Score</h3>
                <p style={{ color: '#86868b', fontSize: '1rem', lineHeight: 1.4 }}>
                  Bewerte und maximiere deine finanzielle Fitness.
                </p>
              </div>
            </div>

            {/* Card 4: Große Doppel-Box */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#0F2238', color: '#ffffff', borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Smartphone size={32} color="#ffffff" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Als native PWA-App nutzbar</h3>
                <p style={{ opacity: 0.7, fontSize: '1rem', maxWidth: '450px', lineHeight: 1.4 }}>
                  Kein App-Store-Zwang. Füge Ankerpunkt einfach direkt über deinen Browser zum Homescreen hinzu. Voll funktionsfähig auf all deinen Apple-Geräten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Apple-Style Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.8rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0F2238', marginBottom: '48px' }}>
          Das Versprechen: Absolut ungebunden.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔒</div>
            <h4 style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '8px' }}>100% Datenschutz</h4>
            <p style={{ color: '#86868b', fontSize: '0.95rem', lineHeight: 1.4 }}>Keine Bankanbindung nötig. Deine Daten gehören dir und verlassen niemals unverschlüsselt dein Gerät.</p>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✨</div>
            <h4 style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '8px' }}>Absolut werbefrei</h4>
            <p style={{ color: '#86868b', fontSize: '0.95rem', lineHeight: 1.4 }}>Keine nervigen Banner, keine Premium-Upsells. Nur du und deine Zahlen in perfektem Fokus.</p>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💶</div>
            <h4 style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '8px' }}>Dauerhaft Kostenlos</h4>
            <p style={{ color: '#86868b', fontSize: '0.95rem', lineHeight: 1.4 }}>Keine versteckten Abos oder monatlichen Kosten. Ein sicherer Hafen für jeden Geldbeutel.</p>
          </div>
        </div>
      </section>

      {/* Final Premium CTA Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 100px' }}>
        <div
          id="landing-auth-info"
          style={{
            padding: '100px 40px',
            textAlign: 'center',
            backgroundColor: '#0F2238',
            color: '#ffffff',
            borderRadius: '40px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(15,34,56,0.15)'
          }}
        >
          {/* Subtiler Deko-Anker im Hintergrund */}
          <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '12rem', opacity: 0.03, pointerEvents: 'none' }}>⚓</div>
          
          <h2 style={{ fontSize: '3.2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px', lineHeight: 1.1 }}>
            Bereit für den sicheren Hafen?
          </h2>
          <p style={{ fontSize: '1.35rem', opacity: 0.7, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Erstelle in weniger als einer Minute dein Profil und nimm das Steuer deiner Finanzen selbst in die Hand.
          </p>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              color: '#0F2238',
              border: 'none',
              borderRadius: '980px',
              padding: '16px 36px',
              fontWeight: '600',
              fontSize: '1.15rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={() => onStart?.()}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Jetzt kostenlos nutzen
          </button>
        </div>
      </section>
    </div>
  )
}