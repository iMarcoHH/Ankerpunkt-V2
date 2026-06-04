import { useRef } from 'react'
import { useStore } from '../store'
import { ALL_TAB_IDS } from './PillNav'

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useStore()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  return (
    <div
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
        const idx = ALL_TAB_IDS.indexOf(activeTab)
        if (dx < 0 && idx < ALL_TAB_IDS.length - 1) setActiveTab(ALL_TAB_IDS[idx + 1])
        else if (dx > 0 && idx > 0) setActiveTab(ALL_TAB_IDS[idx - 1])
      }}
    >
      {children}
    </div>
  )
}
