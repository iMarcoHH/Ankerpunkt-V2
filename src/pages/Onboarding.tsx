import React, { useState } from 'react'
import { useStore } from '../store'
import { ArrowRight, Smartphone, Hand, MonitorSmartphone, Wallet, Receipt, BarChart3, CheckCircle, ExternalLink, SkipForward } from 'lucide-react'

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const { setActiveTab } = useStore()

  const steps = [
    {
      icon: Smartphone,
      title: 'App installieren',
      description: 'Installiere die App auf deinem Homescreen für die beste Nutzungserfahrung.',
      details: (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Smartphone size={18} />
              <p style={{ fontWeight:700, margin:0 }}>iPhone</p>
            </div>
            <p style={{ color:'var(--secondary)' }}>
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
            <p style={{ color:'var(--secondary)' }}>
              1. Browser-Menü öffnen<br />
              2. „App installieren“ auswählen<br />
              3. Installation bestätigen
            </p>
          </div>
        </>
      ),
      actionLabel: 'Installation verstanden',
    },
    {
      icon: Wallet,
      title: 'Erste Einnahme',
      description: 'Lege deine erste Einnahme an und beginne mit der Erfassung deiner Finanzen.',
      details: <p style={{ color:'var(--secondary)' }}>Öffne Buchungen und erfasse dein Gehalt, ALG, Nebenjob oder andere Einnahmen.</p>,
      actionLabel: 'Zu Buchungen',
    },
    {
      icon: Receipt,
      title: 'Erste Ausgabe',
      description: 'Erfasse eine Ausgabe, damit deine Auswertungen aussagekräftig werden.',
      details: <p style={{ color:'var(--secondary)' }}>Zum Beispiel Miete, Strom, Einkäufe oder ein Streaming-Abo.</p>,
      actionLabel: 'Ausgabe erfassen',
    },
    {
      icon: BarChart3,
      title: 'Analysen entdecken',
      description: 'Schaue dir die Analyse-Seite an und erkenne deine Finanzentwicklung.',
      details: <p style={{ color:'var(--secondary)' }}>Cashflow, Kategorien und Trends helfen dir dabei, bessere Entscheidungen zu treffen.</p>,
      actionLabel: 'Analysen ansehen',
    },
    {
      icon: CheckCircle,
      title: 'Fertig',
      description: 'Deine Einrichtung ist abgeschlossen.',
      details: <p style={{ color:'var(--secondary)' }}>Viel Erfolg beim Verwalten deiner Finanzen.</p>,
      actionLabel: 'Einrichtung abschließen',
    }
  ]

  const currentStep = steps[Math.min(step - 1, steps.length - 1)]
  const StepIcon = currentStep.icon
  const isLastStep = step === 5
  const progress = (Math.min(step, 5) / 5) * 100

  const handleAction = () => {
    switch (step) {
      case 2:
      case 3:
        setActiveTab('buchungen')
        break
      case 4:
        setActiveTab('analysen')
        break
      case 5:
        setActiveTab('dashboard')
        break
      default:
        break
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 20px 120px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--tertiary)', marginBottom: 8 }}>
            Schritt {Math.min(step, 5)} von 5
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Hand size={28} color='var(--accent)' />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', margin:0 }}>
              Willkommen
            </h1>
          </div>
          <p style={{
            marginTop: 10,
            color: 'var(--secondary)',
            lineHeight: 1.5
          }}>
            In wenigen Schritten richtest du Finanzpilot vollständig ein.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 24,
            padding: 24,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 20,
            border: '1px solid rgba(0,0,0,0.04)',
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
            <StepIcon size={36} color='var(--accent)' />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {currentStep.title}
          </h2>

          <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            {currentStep.description}
          </p>

          {currentStep.details}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleAction}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 14,
                border: '1px solid rgba(229,72,63,0.15)',
                background: 'rgba(229,72,63,0.05)',
                color: 'var(--accent)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              {currentStep.actionLabel}
              {!isLastStep && <ExternalLink size={16} />}
            </button>
          </div>
        </div>

        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          marginBottom:12
        }}>
          <span style={{ fontSize:13, color:'var(--tertiary)' }}>
            Fortschritt
          </span>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>
            {progress}%
          </span>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: '#EEF0F4',
            overflow: 'hidden',
            marginBottom: 20
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 999,
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <p style={{
          textAlign:'center',
          color:'var(--tertiary)',
          fontSize:13,
          marginBottom:16
        }}>
          {step < 5
            ? `Noch ${5 - step} Schritt${5 - step === 1 ? '' : 'e'} bis zum Abschluss`
            : '🎉 Einrichtung abgeschlossen – zurück zum Dashboard möglich'}
        </p>

        <button
          onClick={() => {
            setStep(5)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          style={{
            width:'100%',
            height:48,
            border:'none',
            background:'transparent',
            color:'var(--tertiary)',
            fontWeight:600,
            marginBottom:12,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:8,
            cursor:'pointer'
          }}
        >
          <SkipForward size={16} />
          Onboarding überspringen
        </button>

        <button
          onClick={() => {
            if (step < 5) {
              setStep(step + 1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
              setActiveTab('dashboard')
            }
          }}
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
          {step < 5 ? 'Nächster Schritt' : 'Onboarding beendet'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}