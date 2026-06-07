import React from 'react'

export default function AnkerpunktMockups() {
  return (
    <div style={{ 
      backgroundColor: '#fbfbfd', 
      padding: '40px 20px', 
      fontFamily: '-apple-system, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '60px',
      alignItems: 'center'
    }}>
      
      {/* ---------------------------------------------------------
          MOCKUP VARIANTE 1: Das Premium iPhone 16 Pro (Hero Center)
         --------------------------------------------------------- */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#0F2238' }}>
          Variante 1: 3D-Premium iPhone Case
        </h3>
        
        {/* Das physische Telefon-Gehäuse */}
        <div style={{
          width: '100%',
          aspectRatio: '1 / 2.15',
          backgroundColor: '#1e1e1e', // Titan Dunkel Rahmen
          borderRadius: '46px',
          padding: '10px',
          boxShadow: '0 25px 50px -12px rgba(15, 34, 56, 0.35), inset 0 0 4px 2px rgba(255,255,255,0.2)',
          position: 'relative',
          border: '1px solid #333',
          transform: 'perspective(1000px) rotateX(4deg)', // Leichter 3D Effekt
        }}>
          {/* Dynamic Island / Ohrmuschel */}
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '26px',
            backgroundColor: '#000000',
            borderRadius: '20px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px'
          }}>
            {/* Kameralinse Spiegelung */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1px solid #222' }}></div>
          </div>

          {/* Lautstärke-Wippe & Power-Button (Seitliche Hardware-Tasten) */}
          <div style={{ position: 'absolute', left: '-3px', top: '120px', width: '3px', height: '32px', backgroundColor: '#333', borderRadius: '3px 0 0 3px' }}></div>
          <div style={{ position: 'absolute', left: '-3px', top: '165px', width: '3px', height: '50px', backgroundColor: '#333', borderRadius: '3px 0 0 3px' }}></div>
          <div style={{ position: 'absolute', right: '-3px', top: '145px', width: '3px', height: '65px', backgroundColor: '#333', borderRadius: '0 3px 3px 0' }}></div>

          {/* Der eigentliche Screen-Inhalt */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '38px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            position: 'relative'
          }}>
            <img 
              src="E36C7B6F-15F8-4253-BDF0-96EBC72ABAD3_1_101_o.jpg" 
              alt="Ankerpunkt Dashboard Screenshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Glas-Glanz-Overlay für den Realismus */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>
      </div>


      {/* ---------------------------------------------------------
          MOCKUP VARIANTE 2: Minimalist Clay-Style (Ideal für Features)
         --------------------------------------------------------- */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#0F2238' }}>
          Variante 2: Clean Clay-Stil (Hell)
        </h3>
        
        <div style={{
          width: '100%',
          aspectRatio: '1 / 2.15',
          backgroundColor: '#ffffff', // Clay-Weiß
          borderRadius: '40px',
          padding: '8px',
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2), 0 2px 4px rgba(0,0,0,0.02)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '32px',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}>
            <img 
              src="A4B8A7AC-20E8-4042-8C7D-28FFB937E538_1_101_o.jpeg" 
              alt="Ankerpunkt Analysen Screenshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>


      {/* ---------------------------------------------------------
          MOCKUP VARIANTE 3: Double App Display (Schwebe-Effekt)
         --------------------------------------------------------- */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px', color: '#0F2238' }}>
          Variante 3: Isometrischer Layer-Effekt (Mehrere Screens)
        </h3>
        
        <div style={{ 
          position: 'relative', 
          height: '420px', 
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* Hinterer Screen (Finanz-Score) */}
          <div style={{
            position: 'absolute',
            left: '10%',
            top: '20px',
            width: '220px',
            aspectRatio: '1 / 2.15',
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '5px',
            boxShadow: '-10px 20px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            transform: 'rotate(-8deg) scale(0.9)',
            zIndex: 1
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
              <img src="54C45791-70B3-4EB0-A2FE-025416BA7095_1_101_o.jpeg" alt="Score" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Vorderer Screen (Kategorie-Budgets) */}
          <div style={{
            position: 'absolute',
            right: '10%',
            top: '0px',
            width: '220px',
            aspectRatio: '1 / 2.15',
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '5px',
            boxShadow: '10px 20px 40px rgba(15,34,56,0.15)',
            border: '1px solid #e2e8f0',
            transform: 'rotate(5deg)',
            zIndex: 2
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
              <img src="5451A215-4106-4C82-A290-598E9F2964B5_1_101_o.jpeg" alt="Budgets" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}