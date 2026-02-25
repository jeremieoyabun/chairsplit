"use client"

import type { ReactNode } from "react"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    // Mobile: full-screen, no chrome
    // Desktop (sm+): centered card with rounded corners + shadow
    <div className="min-h-dvh bg-[#F0F0F3] sm:bg-[#E8E8EC] sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="relative w-full h-dvh sm:w-[430px] sm:h-[900px] sm:max-h-[calc(100dvh-32px)] bg-[#F0F0F3] sm:rounded-[40px] sm:shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  )
}
