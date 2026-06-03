interface AnchorLogoProps {
  size?: number
  whiteBody?: boolean
  className?: string
}

export function AnchorLogo({ size = 32, whiteBody = true, className = '' }: AnchorLogoProps) {
  const body = whiteBody ? '#FFFFFF' : '#0D1B2A'
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" className={className}>
      <circle cx="26" cy="10" r="5" stroke="#C8392B" strokeWidth="2.5" fill="none"/>
      <circle cx="26" cy="10" r="2" fill="#C8392B"/>
      <line x1="26" y1="15" x2="26" y2="44" stroke={body} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="24" x2="40" y2="24" stroke={body} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 24 Q8 32 12 36 Q17 40 26 42 Q35 40 40 36 Q44 32 40 24"
            fill="none" stroke={body} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="36" r="3" fill="#C8392B"/>
      <circle cx="40" cy="36" r="3" fill="#C8392B"/>
    </svg>
  )
}
