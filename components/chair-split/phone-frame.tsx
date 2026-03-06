"use client"

import { type ReactNode, useRef, useState, useCallback } from "react"

export function PhoneFrame({ children, onRefresh }: { children: ReactNode; onRefresh?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pulling, setPulling] = useState(false)
  const [pullY, setPullY] = useState(0)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollRef.current
    if (!el || el.scrollTop > 0) return
    // Don't intercept taps on interactive elements (buttons, links, inputs)
    const target = e.target as HTMLElement
    if (target.closest("button, a, input, select, textarea, [role='button']")) return
    startY.current = e.touches[0].clientY
    isPulling.current = true
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return
    const el = scrollRef.current
    if (!el || el.scrollTop > 0) { isPulling.current = false; setPullY(0); setPulling(false); return }
    const dy = Math.max(0, e.touches[0].clientY - startY.current)
    if (dy > 0) {
      setPullY(Math.min(dy * 0.4, 60))
      setPulling(dy > 80)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (pulling) {
      if (onRefresh) onRefresh()
      else window.location.reload()
    }
    isPulling.current = false
    setPullY(0)
    setPulling(false)
  }, [pulling, onRefresh])

  return (
    // Mobile: full-screen, no chrome
    // Desktop (sm+): centered card with rounded corners + shadow
    <div className="fixed inset-0 bg-[#F0F0F3] sm:bg-[#E8E8EC] sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="relative w-full h-full sm:w-[430px] sm:h-[900px] sm:max-h-[calc(100dvh-32px)] bg-[#F0F0F3] sm:rounded-[40px] sm:shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden">
        {/* Pull-to-refresh indicator */}
        {pullY > 0 && (
          <div
            className="absolute left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ top: pullY - 36, transition: pullY === 0 ? "top 0.2s" : "none" }}
          >
            <div className={`w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg transition-transform ${pulling ? "scale-110" : ""}`}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${pulling ? "rotate-180" : ""}`}
              >
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        )}
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", transform: pullY > 0 ? `translateY(${pullY}px)` : undefined, transition: pullY === 0 ? "transform 0.2s" : "none" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
