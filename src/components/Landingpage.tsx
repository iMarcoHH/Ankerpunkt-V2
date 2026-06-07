import React, { useState } from 'react'
import { ArrowRight, Check, Shield, TrendingUp, Sparkles, Smartphone } from 'lucide-react'

type LandingpageProps = {
  onStart?: () => void
}

export default function Landingpage({ onStart }: LandingpageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'budgets'>('overview')

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#fbfbfd',
        color: '#0F2238',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 1. APPLISH NAVIGATION BAR */}
      <nav
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <img 
            src="C3F3F6CC-0E5F-4795-953E-DAB09B2EE6B4_1_102_o_2.jpeg" 
            alt="Ankerpunkt Logo" 
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
          />
          <span style={{ tracking: '-0.03em' }}>ANKERPUNKT</span>
        </div>
        <button
          type="button"
          style={{
            backgroundColor: '#0F2238',
            color: '#ffffff',
            border: 'none',
            borderRadius: '980px',
            padding: '7px 14px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => onStart?.()}
        >
          App öffnen
        </button>
      </nav>

      {/* MOBILE CONTENT CONTAINER */}
      <main style={{ width: '100%', maxWidth: '480px', padding: '0 20px' }}>
        
        {/* 2. HERO HEADER SECTION */}
        <section style={{ padding: '40px 0 28px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(229, 72, 63, 0.08)',
              color: '#E5483F',
              padding: '6px 16px',
              borderRadius: '980px',
              fontSize: '0.78rem',
              fontWeight: '600',
              marginBottom: '20px',
              letterSpacing: '0.01em',
            }}
          >
            <Sparkles size={12} /> Deine Finanzen im sicheren Hafen
          </div>
          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: '1.1',
              marginBottom: '16px',
              color: '#0F2238'
            }}
          >
            Das Dashboard für <br />
            <span style={{ color: '#E5483F' }}>dein Vermögen.</span>
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: '1.5',
              color: '#64748B',
              fontWeight: '400',
              padding: '0 10px',
              marginBottom: '28px',
            }}
          >
            Verwalte Einnahmen, Ausgaben, Budgets und deinen Finanz-Score an einem Ort. Komplett privat, werbefrei und extrem übersichtlich.
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
              borderRadius: '980px',
              padding: '14px 32px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
              width: '85%',
            }}
            onClick={() => onStart?.()}
          >
            Jetzt kostenlos starten <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </section>

        {/* 3. APP SCREEN INTERACTIVE SHOWCASE */}
        <section style={{ padding: '16px 0 32px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '32px',
              padding: '20px 16px 16px',
              boxShadow: '0 8px 32px rgba(15,34,56,0.04)',
              border: '1px solid rgba(0,0,0,0.03)',
            }}
          >
            {/* Segmented Control Buttons */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F5F6F8',
                borderRadius: '12px',
                padding: '3px',
                marginBottom: '20px',
              }}
            >
              {[
                { id: 'overview', label: 'Übersicht' },
                { id: 'analytics', label: 'Analysen' },
                { id: 'budgets', label: 'Budgets' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '8px 0',
                    borderRadius: '9px',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                    color: activeTab === tab.id ? '#0F2238' : '#64748B',
                    boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Mockup Viewport */}
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#fbfbfd',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              {activeTab === 'overview' && (
                <img
                  src="E36C7B6F-15F8-4253-BDF0-96EBC72ABAD3_1_101_o.jpg"
                  alt="App Übersicht"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
              {activeTab === 'analytics' && (
                <img
                  src="A4B8A7AC-20E8-4042-8C7D-28FFB937E538_1_101_o.jpeg"
                  alt="App Analysen"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
              {activeTab === 'budgets' && (
                <img
                  src="5451A215-4106-4C82-A290-598E9F2964B5_1_101_o.jpeg"
                  alt="App Kategorie-Budgets"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
            </div>
          </div>
        </section>

        {/* 4. VERTIKALES NATIVE BENTO-GRID */}
        <section style={{ padding: '20px 0' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Intuitive Features.
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: '1.45', marginBottom: '24px' }}>
            Erlebe strukturiertes Tracking, angepasst an die Anforderungen moderner PWA-Software.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Bento-Card: Live Cashflow */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F2238' }}>
                  <TrendingUp size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>Dynamische Verlaufsgraphen</h3>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.4' }}>
                    Visualisiere Sparquoten-Entwicklungen und Einnahmen versus Ausgaben direkt über rollierende 12-Monats-Analysen.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento-Card: Score */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F2238' }}>
                  <Shield size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>Dein persönlicher Finanz-Score</h3>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.4' }}>
                    Erhalte direktes, automatisiertes Feedback zu deiner finanziellen Gesundheit basierend auf Versicherungen, Schulden und Sparraten.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '16px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                <img src="54C45791-70B3-4EB0-A2FE-025416BA7095_1_101_o.jpeg" alt="Finanz-Score Ansicht" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>

            {/* Bento-Card: PWA Native */}
            <div style={{ backgroundColor: '#0F2238', color: '#ffffff', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>Native Web-App (PWA)</h3>
                  <p style={{ opacity: 0.75, fontSize: '0.92rem', lineHeight: '1.4' }}>
                    Kein Download im Store nötig. Einfach über die "Zum Home-Bildschirm"-Funktion deines Browsers hinzufügen und offline nutzen.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. PRIVACY & QUALITY CLAUSES */}
        <section style={{ padding: '40px 4px 24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Sicherheit ohne Kompromisse.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { title: 'Keine Bankdaten-Pflicht', desc: 'Du behältst die volle manuelle Kontrolle über deine Buchungen. Keine automatisierten Tracker greifen auf dein Bankkonto zu.' },
              { title: 'Voller Datenexport (CSV & JSON)', desc: 'Deine Daten gehören dir. Exportiere deine Buchungen jederzeit Excel-kompatibel oder ziehe lokale Komplettbackups.' },
              { title: '100% Werbefrei', desc: 'Keine versteckten Banner, Produktplatzierungen oder aufdringliche Versicherungsdeals. Pure Übersicht.' }
            ].map((clause, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E5483F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginTop: '2px' }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px', color: '#0F2238' }}>{clause.title}</h4>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.4' }}>{clause.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. BOTTOM CALL-TO-ACTION BRANDING BLOC */}
        <section style={{ padding: '24px 0 64px' }}>
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '32px',
              boxShadow: '0 12px 40px rgba(15,34,56,0.06)',
              border: '1px solid rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img 
              src="CAEDA7FB-D379-4281-8FB2-AA43D1FDCD31_1_101_o.jpeg" 
              alt="Ankerpunkt Signet" 
              style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '24px' }}
            />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '8px', color: '#0F2238' }}>
              Steuere in den sicheren Hafen.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '28px', lineHeight: '1.45', padding: '0 12px' }}>
              Nimm die Kontrolle über dein Budget jetzt selbst in die Hand. Kostenlos, dauerhaft und plattformübergreifend.
            </p>
            <button
              type="button"
              style={{
                width: '100%',
                backgroundColor: '#0F2238',
                color: '#ffffff',
                border: 'none',
                borderRadius: '980px',
                padding: '15px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15,34,56,0.15)'
              }}
              onClick={() => onStart?.()}
            >
              Anker setzen & App starten
            </button>
          </div>
        </section>

      </main>
    </div>
  )
}