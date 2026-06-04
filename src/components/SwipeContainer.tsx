import { useRef, ReactNode } from 'react'
import { useStore } from '../store'
import { TAB_IDS } from './BottomNav'

export function SwipeContainer({ children }: { children: ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    // Nur horizontal swipes (mehr horizontal als vertikal)
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return

    const currentIndex = TAB_IDS.indexOf(activeTab)
    if (dx < 0 && currentIndex < TAB_IDS.length - 1) {
      // Swipe links → nächster Tab
      setActiveTab(TAB_IDS[currentIndex + 1])
    } else if (dx > 0 && currentIndex > 0) {
      // Swipe rechts → vorheriger Tab
      setActiveTab(TAB_IDS[currentIndex - 1])
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </div>
  )
}
