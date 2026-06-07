import React from 'react'
import { ArrowRight } from 'lucide-react'

type LandingpageProps = {
  onStart?: () => void
}

export default function Landingpage({ onStart }: LandingpageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#0F2238',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 1. NATIVE NAV BAR */}
      <nav
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          <span style={{ color: '#E5483F' }}>⚓</span> ANKERPUNKT
        </div>
        <button
          type="button"
          style={{
            backgroundColor: '#0F2238',
            color: '#ffffff',
            border: 'none',
            borderRadius: '980px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          onClick={() => onStart?.()}
        >
          App öffnen
        </button>
      </nav>

      {/* MAIN CONTAINER OPTIMIZED FOR MOBILE SCREEN WIDTH */}
      <main style={{ width: '100%', maxWidth: '480px', padding: '0 20px' }}>
        
        {/* 2. HERO SECTION */}
        <section style={{ padding: '32px 0 24px', textAlign: 'left' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#F5F6F8',
              color: '#64748B',
              padding: '6px 14px',
              borderRadius: '980px',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '20px',
              letterSpacing: '0.02em',
            }}
          >
            DEINE FINANZEN IM SICHEREN HAFEN
          </div>
          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              lineHeight: '1.1',
              marginBottom: '16px',
            }}
          >
            Das Dashboard für <br />
            <span style={{ color: '#E5483F' }}>dein Vermögen.</span>
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.45',
              color: '#64748B',
              fontWeight: '400',
              marginBottom: '32px',
            }}
          >
            Verwalte Einnahmen, Ausgaben, Sparziele, Budgets und Schulden an einem Ort. Komplett privat, extrem übersichtlich.
          </p>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#0071e3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '980px',
              padding: '14px 28px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              width: 'auto',
            }}
            onClick={() => onStart?.()}
          >
            Kostenlos starten <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </section>

        {/* 3. HERO IMAGE SHOWCASE (Deine echten UI-Screens) */}
        <section style={{ padding: '12px 0 48px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              backgroundColor: '#F5F6F8',
              borderRadius: '32px',
              padding: '24px 24px 0 24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Hier wird dein hochgeladener Übersicht- & Investment-Mockup angezeigt */}
            <img 
              src="6B5AB2B6-FE35-4E93-9DF2-A4B135ED12CF_1_102_o.jpg" 
              alt="Ankerpunkt App Mockups" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 15px 35px rgba(15,34,56,0.12)',
                display: 'block'
              }}
            />
          </div>
        </section>

        {/* 4. APPLE BENTO-GRID FEATURES (Vertikal untereinander für Mobile) */}
        <section style={{ padding: '24px 0' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Alles was du brauchst. Und mehr.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: '1.45', marginBottom: '32px' }}>
            Vergiss unübersichtliche Tabellen. Erlebe intelligentes Finanztracking im preisgekrönten Design.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Bento Card 1: Analysen */}
            <div style={{ backgroundColor: '#F5F6F8', borderRadius: '24px', padding: '32px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>🕒</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '8px' }}>Deep-Dive Analysen</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.45' }}>
                Cashflow, exakte Kategorie-Aufsplittungen und historische Trends intuitiv visualisiert.
              </p>
            </div>

            {/* Bento Card 2: Sparziele */}
            <div style={{ backgroundColor: '#F5F6F8', borderRadius: '24px', padding: '32px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '8px' }}>Smarte Sparziele</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.45' }}>
                Erreiche Träume schneller mit automatischen Prognosen direkt auf deiner UI.
              </p>
            </div>

            {/* Bento Card 3: Finanz-Score */}
            <div style={{ backgroundColor: '#F5F6F8', borderRadius: '24px', padding: '32px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>🛡️</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '8px' }}>Finanz-Score</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.45' }}>
                Bewerte und maximiere deine finanzielle Fitness im zeitlosen Look.
              </p>
            </div>

            {/* Bento Card 4: PWA Highlight (Deep Blue wie dein App-Style) */}
            <div style={{ backgroundColor: '#0F2238', color: '#ffffff', borderRadius: '24px', padding: '32px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>📱</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '8px' }}>Als native PWA-App nutzbar</h3>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.45' }}>
                Kein App-Store-Zwang. Füge Ankerpunkt einfach direkt über deinen Browser zum Homescreen hinzu. Voll funktionsfähig auf all deinen Apple-Geräten.
              </p>
            </div>

          </div>
        </section>

        {/* 5. VERSPRECHEN / BENEFITS SECTION */}
        <section style={{ padding: '64px 0 48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '40px' }}>
            Das Versprechen:<br />Absolut ungebunden.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>🔒</div>
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>100% Datenschutz</h4>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.4' }}>Keine Bankanbindung nötig. Deine Daten gehören dir und verlassen niemals unverschlüsselt dein Gerät.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>✨</div>
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Absolut werbefrei</h4>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.4' }}>Keine nervigen Banner, keine Premium-Upsells. Nur du und deine Zahlen in perfektem Fokus.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>💶</div>
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Dauerhaft Kostenlos</h4>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.4' }}>Keine versteckten Abos oder monatlichen Kosten. Ein sicherer Hafen für jeden Geldbeutel.</p>
            </div>
          </div>
        </section>

        {/* 6. FINAL PREMIUM CALL-TO-ACTION CARD */}
        <section id="landing-auth-info" style={{ padding: '24px 0 80px' }}>
          <div
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              backgroundColor: '#0F2238',
              color: '#ffffff',
              borderRadius: '32px',
              boxShadow: '0 20px 45px rgba(15,34,56,0.18)'
            }}
          >
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: '1.15' }}>
              Bereit für den sicheren Hafen?
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.7, marginBottom: '32px', lineHeight: '1.45' }}>
              Erstelle in weniger als einer Minute dein Profil und nimm das Steuer deiner Finanzen selbst in die Hand.
            </p>
            <button
              type="button"
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#0F2238',
                border: 'none',
                borderRadius: '980px',
                padding: '16px',
                fontWeight: '700',
                fontSize: '1.05rem',
                cursor: 'pointer',
              }}
              onClick={() => onStart?.()}
            >
              Jetzt kostenlos nutzen
            </button>
          </div>
        </section>

      </main>
    </div>
  )
}